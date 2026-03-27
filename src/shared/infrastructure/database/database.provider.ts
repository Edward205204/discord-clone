import { Provider } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { DrizzleDb } from './database.types'
import { DRIZZLE_DB } from './database.constants'
import * as schema from './schema'

export const DatabaseProvider: Provider = {
  provide: DRIZZLE_DB,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): DrizzleDb => {
    const connectionString = configService.getOrThrow<string>('DATABASE_URL')
    const pool = new Pool({
      connectionString,
    })
    return drizzle(pool, { schema })
  },
}
