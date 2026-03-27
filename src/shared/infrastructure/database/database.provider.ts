import { Provider } from '@nestjs/common'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { DrizzleDb } from './database.types'
import { DRIZZLE_DB } from './database.constants'
import * as schema from './schema'
import { env } from '../config/env.config'

export const DatabaseProvider: Provider = {
  provide: DRIZZLE_DB,
  useFactory: (): DrizzleDb => {
    const connectionString = env.DATABASE_URL
    const pool = new Pool({
      connectionString,
    })
    return drizzle(pool, { schema })
  },
}
