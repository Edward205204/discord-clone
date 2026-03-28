import { pgTable, varchar, timestamp, text, uniqueIndex, index, uuid } from 'drizzle-orm/pg-core'

import { VERIFICATION_CODE_VALUES } from 'src/shared/constant/verification-type'
import { users } from '../user/user.schema'

export const verificationCodes = pgTable(
  'verification_codes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull(),
    code: varchar('code', { length: 6 }).notNull(),
    type: text('type', { enum: VERIFICATION_CODE_VALUES }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex('email_type_idx').on(table.email, table.type),
    index('verification_expires_at_idx').on(table.expiresAt),
  ],
)

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    token: text('token').notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('refresh_token_user_id_idx').on(table.userId),
    index('refresh_token_expires_at_idx').on(table.expiresAt),
    uniqueIndex('refresh_token_token_idx').on(table.token),
  ],
)
