// src/shared/database/database.module.ts
import { Global, Module } from '@nestjs/common'
import { DatabaseProvider } from './database.provider'
import { DRIZZLE_DB } from './database.constants'
import { TransactionService } from './transaction.service'

@Global()
@Module({
  providers: [DatabaseProvider, TransactionService],
  exports: [DRIZZLE_DB, TransactionService],
})
export class DatabaseModule {}
