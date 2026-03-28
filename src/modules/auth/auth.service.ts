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
import { TransactionService } from 'src/shared/infrastructure/database/transaction.service'
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
    private readonly txService: TransactionService,
  ) {}

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
    const newUser = await this.txService.run(async (tx) => {
      const createdUser = await this.authRepo.createUser(
        {
          email: body.email,
          userName: body.userName,
          password: hashedPassword,
        },
        tx,
      )

      const tokens = await this.tokenService.generateTokens({
        userId: createdUser.id,
        role: createdUser.role,
      })

      const refreshTokenPayload = this.tokenService.decodeToken(tokens.refreshToken) as { exp?: number } | null

      if (!refreshTokenPayload?.exp) {
        throw new AuthCannotInitializeRefreshTokenException()
      }

      await this.authRepo.createRefreshToken(
        {
          token: tokens.refreshToken,
          userId: createdUser.id,
          expiresAt: new Date(refreshTokenPayload.exp * 1000),
        },
        tx,
      )

      await this.authRepo.deleteVerificationCodeById(verificationCode.id, tx)

      return { user: createdUser, tokens }
    })
    return {
      accessToken: newUser.tokens.accessToken,
      refreshToken: newUser.tokens.refreshToken,
      user: {
        id: newUser.user.id,
        email: newUser.user.email,
        userName: newUser.user.userName,
        avatar: newUser.user.avatar,
        role: newUser.user.role,
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

    await this.txService.run(async (tx) => {
      await this.authRepo.updatePasswordByUserId(user.id, hashedPassword, tx)
      await this.authRepo.deleteRefreshTokensByUserId(user.id, tx)
      await this.authRepo.deleteVerificationCodeById(verificationCode.id, tx)
    })

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

    await this.txService.run(async (tx) => {
      await this.authRepo.deleteRefreshTokenByRawToken(body.refreshToken, tx)
      await this.authRepo.createRefreshToken(
        {
          token: tokens.refreshToken,
          userId: refreshToken.userId,
          expiresAt: new Date(exp * 1000),
        },
        tx,
      )
    })

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }
  }
}
