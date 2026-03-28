import { relations } from 'drizzle-orm'
import { ROLE_VALUES } from 'src/shared/constant/system-role'

import { pgTable, varchar, timestamp, text, uuid } from 'drizzle-orm/pg-core'
import { refreshTokens, verificationCodes } from '../auth/auth.schema'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  userName: varchar('user_name', { length: 64 }).notNull(),
  avatar: varchar('avatar', { length: 255 }).notNull().default(''),
  role: text('role', { enum: ROLE_VALUES }).notNull().default('user'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export const usersRelations = relations(users, ({ many }) => ({
  verificationCodes: many(verificationCodes),
  refreshTokens: many(refreshTokens),
}))
