import { Inject, Injectable } from '@nestjs/common'
import { DRIZZLE_DB } from './database.constants'
import type { DrizzleDb } from './database.types'

@Injectable()
export class TransactionService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDb) {}

  async run<T>(work: (tx: DrizzleDb) => Promise<T>): Promise<T> {
    return this.db.transaction(work)
  }
}
