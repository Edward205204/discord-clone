import { TransactionHost } from '@nestjs-cls/transactional'
import { Injectable } from '@nestjs/common'
import type { MyDrizzleAdapter } from 'src/shared/infrastructure/database/database.types'
import { eq } from 'drizzle-orm'
import { users } from './user.schema'
import { UpdateUserBodyType } from './user.model'

@Injectable()
export class UserRepository {
  constructor(private readonly txHost: TransactionHost<MyDrizzleAdapter>) {}

  async findUserById(id: string) {
    const [user] = await this.txHost.tx
      .select({ id: users.id, email: users.email, userName: users.userName, avatar: users.avatar, role: users.role })
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
    return user
  }

  async updateUserById(id: string, data: Partial<UpdateUserBodyType>) {
    const [user] = await this.txHost.tx
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning({ id: users.id, email: users.email, userName: users.userName, avatar: users.avatar, role: users.role })
    return user
  }

  // ------
  async findUserIdByEmail(email: string) {
    const [userId] = await this.txHost.tx.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)

    return userId
  }

  async findUserByEmailWithCredentials(email: string) {
    const [user] = await this.txHost.tx
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

  async createUser(payload: { email: string; userName: string; password: string; avatar?: string }) {
    const [createdUser] = await this.txHost.tx
      .insert(users)
      .values({
        ...payload,
      })
      .returning({ id: users.id, role: users.role, avatar: users.avatar, email: users.email, userName: users.userName })

    return createdUser
  }

  async updatePasswordByUserId(userId: string, hashedPassword: string) {
    await this.txHost.tx
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, userId))
  }
}
