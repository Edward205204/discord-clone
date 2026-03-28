import { Inject, Injectable } from '@nestjs/common'
import { and, eq, gt } from 'drizzle-orm'
import { DRIZZLE_DB } from 'src/shared/infrastructure/database/database.constants'
import type { DrizzleDb } from 'src/shared/infrastructure/database/database.types'
import { refreshTokens, verificationCodes } from './auth.schema'
import { VerificationCodeType } from 'src/shared/constant/verification-type'
import { users } from '../user/user.schema'

@Injectable()
export class AuthRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDb) {}

  async findUserIdByEmail(email: string) {
    const [userId] = await this.db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)

    return userId
  }

  async findUserByEmailWithCredentials(email: string) {
    const [user] = await this.db
      .select({
        id: users.id,
        password: users.password,
        email: users.email,
        userName: users.userName,
        avatar: users.avatar,
        role: users.role,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    return user
  }

  async findVerificationLastSentAt(email: string, type: VerificationCodeType) {
    const [row] = await this.db
      .select({ updatedAt: verificationCodes.updatedAt })
      .from(verificationCodes)
      .where(and(eq(verificationCodes.email, email), eq(verificationCodes.type, type)))
      .limit(1)

    return row
  }

  async findValidVerificationCodeId(email: string, otp: string, type: VerificationCodeType) {
    const [verificationCode] = await this.db
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

  async findRefreshTokenByToken(token: string, db: DrizzleDb = this.db) {
    const [tokens] = await db.select().from(refreshTokens).where(eq(refreshTokens.token, token)).limit(1)
    return tokens
  }

  async createUser(
    payload: { email: string; userName: string; password: string; avatar?: string },
    db: DrizzleDb = this.db,
  ) {
    const [createdUser] = await db
      .insert(users)
      .values({
        ...payload,
      })
      .returning({ id: users.id, role: users.role, avatar: users.avatar, email: users.email, userName: users.userName })

    return createdUser
  }

  async createRefreshToken(payload: { token: string; userId: string; expiresAt: Date }, db: DrizzleDb = this.db) {
    await db.insert(refreshTokens).values(payload)
  }

  async deleteRefreshTokenByRawToken(token: string, db: DrizzleDb = this.db) {
    await db.delete(refreshTokens).where(eq(refreshTokens.token, token))
  }

  async deleteRefreshTokensByUserId(userId: string, db: DrizzleDb = this.db) {
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId))
  }

  async updatePasswordByUserId(userId: string, hashedPassword: string, db: DrizzleDb = this.db) {
    await db.update(users).set({ password: hashedPassword, updatedAt: new Date() }).where(eq(users.id, userId))
  }

  async deleteVerificationCodeById(verificationCodeId: string, db: DrizzleDb = this.db) {
    await db.delete(verificationCodes).where(eq(verificationCodes.id, verificationCodeId))
  }

  async upsertVerificationCode(
    payload: { email: string; code: string; expiresAt: Date; type: VerificationCodeType },
    db: DrizzleDb = this.db,
  ) {
    await db
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
