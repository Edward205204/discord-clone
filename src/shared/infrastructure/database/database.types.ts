// src/shared/database/database.types.ts
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import * as schema from './schema'

export type DrizzleDb = NodePgDatabase<typeof schema>
