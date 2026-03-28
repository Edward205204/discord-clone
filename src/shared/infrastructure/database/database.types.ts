import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { TransactionalAdapterDrizzleOrm } from '@nestjs-cls/transactional-adapter-drizzle-orm'
import * as schema from './schema'

export type DrizzleDb = NodePgDatabase<typeof schema>

export type MyDrizzleAdapter = TransactionalAdapterDrizzleOrm<DrizzleDb>
