import { pgTable, uuid, varchar, boolean, integer, timestamp, primaryKey, index, text } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from '../user/user.schema'
import { SERVER_ROLE_VALUES, ServerRole } from 'src/shared/constant/server-role'
import { channels } from '../channel/channel.schema'

// ─────────────────────────────────────────────
// servers
// ─────────────────────────────────────────────
export const servers = pgTable('servers', {
  id: uuid('id').primaryKey().defaultRandom(),
  avatar: varchar('avatar', { length: 255 }),
  name: varchar('name', { length: 100 }).notNull(),
  ownerId: uuid('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const serversRelations = relations(servers, ({ one, many }) => ({
  owner: one(users, { fields: [servers.ownerId], references: [users.id] }),
  channels: many(channels),
  memberships: many(memberships),
  invites: many(serverInvites),
}))

// ─────────────────────────────────────────────
// memberships  (user ↔ server)
// ─────────────────────────────────────────────
// role: 'owner' | 'member'
// joinedViaCode: invite code dùng để join — null nếu là owner tạo server
export const memberships = pgTable(
  'memberships',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    serverId: uuid('server_id')
      .notNull()
      .references(() => servers.id, { onDelete: 'cascade' }),
    role: text('role', { enum: SERVER_ROLE_VALUES }).notNull().default(ServerRole.Member),
    joinedViaCode: varchar('joined_via_code', { length: 64 }),
    joinedAt: timestamp('joined_at').notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.serverId] }), index('memberships_server_id_idx').on(t.serverId)],
)

export const membershipsRelations = relations(memberships, ({ one }) => ({
  user: one(users, { fields: [memberships.userId], references: [users.id] }),
  server: one(servers, { fields: [memberships.serverId], references: [servers.id] }),
}))

// ─────────────────────────────────────────────
// server_invites
// ─────────────────────────────────────────────
// expiresAt: null = vĩnh viễn
// maxUses:   null = không giới hạn
// isRevoked: true = bị vô hiệu hóa sớm bởi owner
export const serverInvites = pgTable(
  'server_invites',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    serverId: uuid('server_id')
      .notNull()
      .references(() => servers.id, { onDelete: 'cascade' }),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    code: varchar('code', { length: 64 }).notNull().unique(),
    expiresAt: timestamp('expires_at'),
    maxUses: integer('max_uses'),
    useCount: integer('use_count').notNull().default(0),
    isRevoked: boolean('is_revoked').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [index('server_invites_server_id_idx').on(t.serverId)],
)

export const serverInvitesRelations = relations(serverInvites, ({ one }) => ({
  server: one(servers, { fields: [serverInvites.serverId], references: [servers.id] }),
  createdBy: one(users, { fields: [serverInvites.createdBy], references: [users.id] }),
}))
