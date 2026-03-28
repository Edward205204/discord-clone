import { Inject, Injectable } from '@nestjs/common'
import { DRIZZLE_DB } from 'src/shared/infrastructure/database/database.constants'
import type { DrizzleDb } from 'src/shared/infrastructure/database/database.types'

import { eq } from 'drizzle-orm'
import { users } from './user.schema'

@Injectable()
export class UserRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDb) {}

  async findUserById(id: string, db: DrizzleDb = this.db) {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
    return user
  }
}
