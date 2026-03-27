import { pgTable, varchar, timestamp, text, uniqueIndex, index, uuid } from 'drizzle-orm/pg-core'

const VerificationCodeType = ['registration', 'reset_password', 'verify_email'] as const

export const verificationCodes = pgTable(
  'verification_codes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull(),
    code: varchar('code', { length: 6 }).notNull(), // Code thường ngắn (6 số)
    type: text('type', { enum: VerificationCodeType }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    userId: uuid('user_id'),
    // userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [
    uniqueIndex('email_type_code_idx').on(table.email, table.type, table.code),
    index('verification_expires_at_idx').on(table.expiresAt),
  ],
)

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    token: text('token').primaryKey(),
    userId: uuid('user_id').notNull(),
    // .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [index('token_user_id_idx').on(table.userId), index('token_expires_at_idx').on(table.expiresAt)],
)
