import { TransactionHost } from '@nestjs-cls/transactional'
import { Injectable } from '@nestjs/common'
import { and, eq, gt } from 'drizzle-orm'
import type { MyDrizzleAdapter } from 'src/shared/infrastructure/database/database.types'
import { refreshTokens, verificationCodes } from './auth.schema'
import { VerificationCodeType } from 'src/shared/constant/verification-type'

@Injectable()
export class AuthRepository {
  constructor(private readonly txHost: TransactionHost<MyDrizzleAdapter>) {}

  async findVerificationLastSentAt(email: string, type: VerificationCodeType) {
    const [row] = await this.txHost.tx
      .select({ updatedAt: verificationCodes.updatedAt })
      .from(verificationCodes)
      .where(and(eq(verificationCodes.email, email), eq(verificationCodes.type, type)))
      .limit(1)

    return row
  }

  async findValidVerificationCodeId(email: string, otp: string, type: VerificationCodeType) {
    const [verificationCode] = await this.txHost.tx
      .select({ id: verificationCodes.id })
      .from(verificationCodes)
      .where(
        and(
          eq(verificationCodes.email, email),
          eq(verificationCodes.code, otp),
          eq(verificationCodes.type, type),
          gt(verificationCodes.expiresAt, new Date()),
        ),
      )
      .limit(1)

    return verificationCode
  }

  async findRefreshTokenByToken(token: string) {
    const [tokens] = await this.txHost.tx.select().from(refreshTokens).where(eq(refreshTokens.token, token)).limit(1)
    return tokens
  }

  async createRefreshToken(payload: { token: string; userId: string; expiresAt: Date }) {
    await this.txHost.tx.insert(refreshTokens).values(payload)
  }

  async deleteRefreshTokenByRawToken(token: string) {
    await this.txHost.tx.delete(refreshTokens).where(eq(refreshTokens.token, token))
  }

  async deleteRefreshTokensByUserId(userId: string) {
    await this.txHost.tx.delete(refreshTokens).where(eq(refreshTokens.userId, userId))
  }

  async deleteVerificationCodeById(verificationCodeId: string) {
    await this.txHost.tx.delete(verificationCodes).where(eq(verificationCodes.id, verificationCodeId))
  }

  async upsertVerificationCode(payload: { email: string; code: string; expiresAt: Date; type: VerificationCodeType }) {
    await this.txHost.tx
      .insert(verificationCodes)
      .values({
        email: payload.email,
        code: payload.code,
        type: payload.type,
        expiresAt: payload.expiresAt,
      })
      .onConflictDoUpdate({
        target: [verificationCodes.email, verificationCodes.type],
        set: {
          code: payload.code,
          expiresAt: payload.expiresAt,
          updatedAt: new Date(),
        },
      })
  }
}
