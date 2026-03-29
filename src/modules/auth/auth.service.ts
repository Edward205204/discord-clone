import { Transactional } from '@nestjs-cls/transactional'
import { Injectable, Logger } from '@nestjs/common'
import { randomInt } from 'node:crypto'
import { env } from 'src/shared/infrastructure/config/env.config'
import { HashingService } from 'src/shared/infrastructure/security/hashing.service'
import { TokenService } from 'src/shared/infrastructure/security/token.service'
import {
  LoginBodyType,
  LogoutBodyType,
  RefreshTokenBodyType,
  RegisterBodyType,
  ResetPasswordBodyType,
  SendRegistrationVerificationBodyType,
  SendResetPasswordVerificationBodyType,
} from './auth.model'
import { AuthRepository } from './auth.repo'
import { VerificationCode } from 'src/shared/constant/verification-type'
import {
  AuthCannotInitializeRefreshTokenException,
  AuthEmailAlreadyExistsUnprocessableException,
  AuthEmailAlreadyRegisteredConflictException,
  AuthEmailNotFoundConflictException,
  AuthInvalidLoginCredentialsException,
  AuthInvalidOrExpiredOtpException,
  AuthInvalidRefreshTokenException,
  AuthOtpRateLimitedException,
} from './auth.exceptions'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly authRepo: AuthRepository,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
  ) {}

  @Transactional()
  async registerTransaction(hashedPassword: string, email: string, userName: string, verificationCodeId: string) {
    const createdUser = await this.authRepo.createUser({
      email,
      userName,
      password: hashedPassword,
    })

    const tokens = await this.tokenService.generateTokens({
      userId: createdUser.id,
      role: createdUser.role,
    })

    const refreshTokenPayload = this.tokenService.decodeToken(tokens.refreshToken) as { exp?: number } | null

    if (!refreshTokenPayload?.exp) {
      throw new AuthCannotInitializeRefreshTokenException()
    }

    await this.authRepo.createRefreshToken({
      token: tokens.refreshToken,
      userId: createdUser.id,
      expiresAt: new Date(refreshTokenPayload.exp * 1000),
    })

    await this.authRepo.deleteVerificationCodeById(verificationCodeId)

    return { user: createdUser, tokens }
  }

  @Transactional()
  async refreshTokenTransaction(oldRefreshToken: string, newRefreshToken: string, userId: string, expiresAt: Date) {
    await this.authRepo.deleteRefreshTokenByRawToken(oldRefreshToken)
    await this.authRepo.createRefreshToken({
      token: newRefreshToken,
      userId: userId,
      expiresAt,
    })
  }

  @Transactional()
  async resetPasswordTransaction(userId: string, hashedPassword: string, verificationCodeId: string) {
    await this.authRepo.updatePasswordByUserId(userId, hashedPassword)
    await this.authRepo.deleteRefreshTokensByUserId(userId)
    await this.authRepo.deleteVerificationCodeById(verificationCodeId)
  }

  async register(body: RegisterBodyType) {
    const userId = await this.authRepo.findUserIdByEmail(body.email)

    if (userId) {
      throw new AuthEmailAlreadyExistsUnprocessableException()
    }
    const verificationCode = await this.authRepo.findValidVerificationCodeId(
      body.email,
      body.otp,
      VerificationCode.REGISTRATION,
    )
    if (!verificationCode) {
      throw new AuthInvalidOrExpiredOtpException('otp')
    }

    const hashedPassword = await this.hashingService.hash(body.password)

    const data = await this.registerTransaction(hashedPassword, body.email, body.userName, verificationCode.id)
    return {
      accessToken: data.tokens.accessToken,
      refreshToken: data.tokens.refreshToken,
      user: {
        id: data.user.id,
        email: data.user.email,
        userName: data.user.userName,
        avatar: data.user.avatar,
        role: data.user.role,
      },
    }
  }

  async login(body: LoginBodyType) {
    const user = await this.authRepo.findUserByEmailWithCredentials(body.email)
    if (!user) {
      throw new AuthInvalidLoginCredentialsException()
    }

    const isCorrectPassword = await this.hashingService.compare(body.password, user.password)
    if (!isCorrectPassword) {
      throw new AuthInvalidLoginCredentialsException()
    }

    const tokens = await this.tokenService.generateTokens({
      userId: user.id,
      role: user.role,
    })

    const refreshTokenPayload = this.tokenService.decodeToken(tokens.refreshToken) as { exp?: number } | null
    if (!refreshTokenPayload?.exp) {
      throw new AuthCannotInitializeRefreshTokenException()
    }

    await this.authRepo.createRefreshToken({
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: new Date(refreshTokenPayload.exp * 1000),
    })

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        userName: user.userName,
        avatar: user.avatar,
        role: user.role,
      },
    }
  }

  async sendRegistrationVerificationCode(body: SendRegistrationVerificationBodyType) {
    const existingUser = await this.authRepo.findUserIdByEmail(body.email)

    if (existingUser) {
      throw new AuthEmailAlreadyRegisteredConflictException()
    }

    const lastSend = await this.authRepo.findVerificationLastSentAt(body.email, VerificationCode.REGISTRATION)
    if (lastSend) {
      const elapsedMs = Date.now() - lastSend.updatedAt.getTime()
      if (elapsedMs < env.OTP_BUFFER_MS) {
        const retryAfterSec = Math.max(1, Math.ceil((env.OTP_BUFFER_MS - elapsedMs) / 1000))
        throw new AuthOtpRateLimitedException(retryAfterSec)
      }
    }

    const code = randomInt(0, 1_000_000).toString().padStart(env.OTP_LENGTH, '0')
    const expiresAt = new Date(Date.now() + env.OTP_TTL_MS)

    await this.authRepo.upsertVerificationCode({
      email: body.email,
      code,
      expiresAt,
      type: VerificationCode.REGISTRATION,
    })

    this.logger.log(
      `[DEV] Registration verification code for ${body.email}: ${code} (expires ${expiresAt.toISOString()})`,
    )

    return { message: 'Verification code sent' }
  }

  async sendResetPasswordVerificationCode(body: SendResetPasswordVerificationBodyType) {
    const user = await this.authRepo.findUserIdByEmail(body.email)
    if (!user) {
      throw new AuthEmailNotFoundConflictException()
    }
    const lastSend = await this.authRepo.findVerificationLastSentAt(body.email, VerificationCode.RESET_PASSWORD)
    if (lastSend) {
      const elapsedMs = Date.now() - lastSend.updatedAt.getTime()
      if (elapsedMs < env.OTP_BUFFER_MS) {
        const retryAfterSec = Math.max(1, Math.ceil((env.OTP_BUFFER_MS - elapsedMs) / 1000))
        throw new AuthOtpRateLimitedException(retryAfterSec)
      }
    }

    const code = randomInt(0, 1_000_000).toString().padStart(env.OTP_LENGTH, '0')
    const expiresAt = new Date(Date.now() + env.OTP_TTL_MS)

    await this.authRepo.upsertVerificationCode({
      email: body.email,
      code,
      expiresAt,
      type: VerificationCode.RESET_PASSWORD,
    })

    this.logger.log(
      `[DEV] Reset password verification code for ${body.email}: ${code} (expires ${expiresAt.toISOString()})`,
    )

    return { message: 'Verification code sent' }
  }

  async resetPassword(body: ResetPasswordBodyType) {
    const verificationCode = await this.authRepo.findValidVerificationCodeId(
      body.email,
      body.otp,
      VerificationCode.RESET_PASSWORD,
    )
    if (!verificationCode) {
      throw new AuthInvalidOrExpiredOtpException('otp')
    }

    const user = await this.authRepo.findUserByEmailWithCredentials(body.email)
    if (!user) {
      throw new AuthInvalidOrExpiredOtpException('email')
    }

    const hashedPassword = await this.hashingService.hash(body.password)

    await this.resetPasswordTransaction(user.id, hashedPassword, verificationCode.id)

    return { message: 'Password has been reset successfully' }
  }

  async logout(body: LogoutBodyType) {
    await this.authRepo.deleteRefreshTokenByRawToken(body.refreshToken)
    return { message: 'Logged out successfully' }
  }

  async refreshToken(body: RefreshTokenBodyType) {
    const tokenPayload = await this.tokenService.verifyRefreshToken(body.refreshToken)

    const refreshToken = await this.authRepo.findRefreshTokenByToken(body.refreshToken)

    if (!refreshToken) {
      throw new AuthInvalidRefreshTokenException('Invalid refresh token')
    }

    const tokens = await this.tokenService.generateTokens({
      userId: refreshToken.userId,
      role: tokenPayload.role,
    })

    const refreshTokenPayload = this.tokenService.decodeToken(tokens.refreshToken) as { exp?: number } | null

    if (!refreshTokenPayload?.exp) {
      throw new AuthCannotInitializeRefreshTokenException()
    }

    const exp = refreshTokenPayload.exp

    await this.refreshTokenTransaction(
      body.refreshToken,
      tokens.refreshToken,
      refreshToken.userId,
      new Date(exp * 1000),
    )

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }
  }
}
