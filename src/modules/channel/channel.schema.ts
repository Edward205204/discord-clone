import { pgTable, uuid, varchar, boolean, timestamp, primaryKey, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from '../user/user.schema'
import { servers } from '../server/server.schema'

// ─────────────────────────────────────────────
// channels
// ─────────────────────────────────────────────
// is_private = true → chỉ hiện với owner và user được add vào channel_members
export const channels = pgTable(
  'channels',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    serverId: uuid('server_id')
      .notNull()
      .references(() => servers.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 100 }).notNull(),
    isPrivate: boolean('is_private').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [index('channels_server_is_private_created_at_idx').on(t.serverId, t.isPrivate, t.createdAt)],
)

export const channelsRelations = relations(channels, ({ one, many }) => ({
  server: one(servers, { fields: [channels.serverId], references: [servers.id] }),
  members: many(channelMembers),
}))

// ─────────────────────────────────────────────
// channel_members  (user ↔ private channel)
// ─────────────────────────────────────────────
// Chỉ dùng khi channel.is_private = true
// Permission check: nếu channel public → chỉ cần check memberships
//                   nếu channel private → cần check channel_members thêm
export const channelMembers = pgTable(
  'channel_members',
  {
    channelId: uuid('channel_id')
      .notNull()
      .references(() => channels.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    addedAt: timestamp('added_at').notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.channelId, t.userId] }),
    index('channel_members_user_id_added_at_idx').on(t.userId, t.addedAt),
    index('channel_members_channel_id_added_at_idx').on(t.channelId, t.addedAt),
  ],
)

export const channelMembersRelations = relations(channelMembers, ({ one }) => ({
  channel: one(channels, { fields: [channelMembers.channelId], references: [channels.id] }),
  user: one(users, { fields: [channelMembers.userId], references: [users.id] }),
}))
