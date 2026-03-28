import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common'
import { HashingService } from 'src/shared/infrastructure/security/hashing.service'
import { TokenService } from 'src/shared/infrastructure/security/token.service'
import { LoginBodyType, RegisterBodyType } from './auth.model'
import { AuthRepository } from './auth.repo'
import { TransactionService } from 'src/shared/infrastructure/database/transaction.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepo: AuthRepository,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    private readonly txService: TransactionService,
  ) {}

  async register(body: RegisterBodyType) {
    const userId = await this.authRepo.getUserIdByEmail(body.email)

    if (userId) {
      throw new ConflictException('Email already exists')
    }
    const verificationCode = await this.authRepo.getValidRegistrationVerificationCodeId(body.email, body.otp)
    if (!verificationCode) {
      throw new BadRequestException('Invalid or expired OTP')
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
        throw new InternalServerErrorException('Cannot initialize refresh token')
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
      throw new UnauthorizedException('Invalid email or password')
    }

    const isCorrectPassword = await this.hashingService.compare(body.password, user.password)
    if (!isCorrectPassword) {
      throw new UnauthorizedException('Invalid email or password')
    }

    const tokens = await this.tokenService.generateTokens({
      userId: user.id,
      role: user.role,
    })

    const refreshTokenPayload = this.tokenService.decodeToken(tokens.refreshToken) as { exp?: number } | null
    if (!refreshTokenPayload?.exp) {
      throw new InternalServerErrorException('Cannot initialize refresh token')
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
}
