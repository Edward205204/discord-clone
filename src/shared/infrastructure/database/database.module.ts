// src/shared/database/database.module.ts
import { Global, Module } from '@nestjs/common'
import { DatabaseProvider } from './database.provider'
import { DRIZZLE_DB } from './database.constants'

@Global()
@Module({
  providers: [DatabaseProvider],
  exports: [DRIZZLE_DB],
})
export class DatabaseModule {}
