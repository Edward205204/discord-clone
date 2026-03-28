import { TransactionHost } from '@nestjs-cls/transactional'
import { Injectable } from '@nestjs/common'
import type { MyDrizzleAdapter } from 'src/shared/infrastructure/database/database.types'

import { eq } from 'drizzle-orm'
import { users } from './user.schema'

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
}
