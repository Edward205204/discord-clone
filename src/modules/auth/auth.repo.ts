import { Inject, Injectable } from '@nestjs/common'
import { and, eq, gt } from 'drizzle-orm'
import { DRIZZLE_DB } from 'src/shared/infrastructure/database/database.constants'
import type { DrizzleDb } from 'src/shared/infrastructure/database/database.types'
import { refreshTokens, users, verificationCodes } from './auth.schema'

@Injectable()
export class AuthRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDb) {}

  async getUserIdByEmail(email: string) {
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

  async getValidRegistrationVerificationCodeId(email: string, otp: string) {
    const [verificationCode] = await this.db
      .select({ id: verificationCodes.id })
      .from(verificationCodes)
      .where(
        and(
          eq(verificationCodes.email, email),
          eq(verificationCodes.code, otp),
          eq(verificationCodes.type, 'registration'),
          gt(verificationCodes.expiresAt, new Date()),
        ),
      )
      .limit(1)

    return verificationCode
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

  async deleteVerificationCodeById(verificationCodeId: string, db: DrizzleDb = this.db) {
    await db.delete(verificationCodes).where(eq(verificationCodes.id, verificationCodeId))
  }
}
