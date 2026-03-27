import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { env } from 'src/shared/infrastructure/config/env.config'
import TokenPayload from 'src/shared/types/token.payload'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  decodeToken(token: string): any {
    return this.jwtService.decode(token)
  }

  signAccessToken(payload: Pick<TokenPayload, 'userId' | 'role'>) {
    return this.jwtService.signAsync(
      { ...payload, id: uuidv4() },
      {
        secret: env.ACCESS_TOKEN_SECRET,
        expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as any,
        algorithm: 'HS256',
      },
    )
  }

  signRefreshToken(payload: Pick<TokenPayload, 'userId' | 'role'>) {
    return this.jwtService.signAsync(
      { ...payload, id: uuidv4() },
      {
        secret: env.REFRESH_TOKEN_SECRET,
        expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as any,
        algorithm: 'HS256',
      },
    )
  }

  async generateTokens(payload: Pick<TokenPayload, 'userId' | 'role'>) {
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(payload),
      this.signRefreshToken(payload),
    ])

    return { accessToken, refreshToken }
  }

  verifyAccessToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: env.ACCESS_TOKEN_SECRET,
    })
  }

  verifyRefreshToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: env.REFRESH_TOKEN_SECRET,
    })
  }
}
