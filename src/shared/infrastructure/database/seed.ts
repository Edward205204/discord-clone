import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import bcrypt from 'bcrypt'

import { env } from '../config/env.config'
import { users } from '../../../modules/user/user.schema'
import { channels } from '../../../modules/channel/channel.schema'
import { memberships, servers } from '../../../modules/server/server.schema'

const PRIMARY_USER_ID = '53a95b91-bafc-451a-aed4-9b7112c12d35'
const SALT_ROUNDS = 10

const seedUsers = [
  {
    id: PRIMARY_USER_ID,
    email: 'nguyentminhkhoa1@gmail.com',
    userName: 'Edward205204',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=edward205204',
    role: 'user' as const,
  },
  {
    id: '2cb9ce59-d464-4c6f-9e4e-2f7278a6db11',
    email: 'luna@chat-system.dev',
    userName: 'Luna Pixel',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luna-pixel',
    role: 'user' as const,
  },
  {
    id: '9d0ab4dc-ef11-4e7d-afec-f3f7d89241ab',
    email: 'kai@chat-system.dev',
    userName: 'Kai Nova',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=kai-nova',
    role: 'user' as const,
  },
  {
    id: 'f49ad04d-56b6-4e97-b621-fd7f6432bfbe',
    email: 'mina@chat-system.dev',
    userName: 'Mina Orbit',
    avatar: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=mina-orbit',
    role: 'user' as const,
  },
]

const seedServers = [
  {
    id: 'a1d9f1e0-2e25-4f5a-bbc1-7d7f8b5c91a0',
    name: 'English Lounge',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=english-lounge',
    ownerId: PRIMARY_USER_ID,
  },
  {
    id: 'bb8c3a2b-f8f6-4f98-8da1-e2ef95a6fbc1',
    name: 'C2 Community',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=c2-community',
    ownerId: '2cb9ce59-d464-4c6f-9e4e-2f7278a6db11',
  },
  {
    id: 'f24f8044-5ea6-4c2a-bf18-e0b34d5ab4e1',
    name: 'Gaming Zone',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=gaming-zone',
    ownerId: '9d0ab4dc-ef11-4e7d-afec-f3f7d89241ab',
  },
  {
    id: '76c58a9e-68ff-4319-b7ea-4d42596f64b8',
    name: 'Design Circle',
    avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=design-circle',
    ownerId: PRIMARY_USER_ID,
  },
]

const seedChannels = [
  {
    id: '09eefadf-8d6f-4d22-86b5-22c79f4af9e1',
    serverId: 'a1d9f1e0-2e25-4f5a-bbc1-7d7f8b5c91a0',
    name: 'general',
    isPrivate: false,
    isDefault: true,
  },
  {
    id: '35556986-a039-4376-ac6d-95f65fcd6652',
    serverId: 'a1d9f1e0-2e25-4f5a-bbc1-7d7f8b5c91a0',
    name: 'daily-talk',
    isPrivate: false,
  },
  {
    id: '0f1f1b43-f4dd-4dfa-a2fc-0615ecf5628d',
    serverId: 'bb8c3a2b-f8f6-4f98-8da1-e2ef95a6fbc1',
    name: 'general',
    isPrivate: false,
    isDefault: true,
  },
  {
    id: '95f37db0-9f89-454a-b57e-5dd90c86f33e',
    serverId: 'bb8c3a2b-f8f6-4f98-8da1-e2ef95a6fbc1',
    name: 'ielts-resources',
    isPrivate: false,
  },
  {
    id: '8dd49192-225f-4d73-b18c-f798296ea272',
    serverId: 'f24f8044-5ea6-4c2a-bf18-e0b34d5ab4e1',
    name: 'general',
    isPrivate: false,
    isDefault: true,
  },
  {
    id: 'da572b8b-e2c0-4ef3-b1db-30044e33ecf8',
    serverId: 'f24f8044-5ea6-4c2a-bf18-e0b34d5ab4e1',
    name: 'looking-for-team',
    isPrivate: false,
  },
  {
    id: '6ca75378-ed74-47f6-9bb6-b5f9ddbd9df8',
    serverId: '76c58a9e-68ff-4319-b7ea-4d42596f64b8',
    name: 'general',
    isPrivate: false,
    isDefault: true,
  },
  {
    id: 'b3ff79c7-a17d-4674-b510-ca9d3f4a5719',
    serverId: '76c58a9e-68ff-4319-b7ea-4d42596f64b8',
    name: 'showcase',
    isPrivate: false,
  },
]

function buildMembershipRows() {
  const rows: Array<{
    userId: string
    serverId: string
    role: 'owner' | 'member'
    joinedViaCode: string | null
  }> = []

  for (const server of seedServers) {
    rows.push({
      userId: server.ownerId,
      serverId: server.id,
      role: 'owner',
      joinedViaCode: null,
    })

    if (server.ownerId !== PRIMARY_USER_ID) {
      rows.push({
        userId: PRIMARY_USER_ID,
        serverId: server.id,
        role: 'member',
        joinedViaCode: 'seed-direct-join',
      })
    }
  }

  return rows
}

async function runSeed() {
  const pool = new Pool({ connectionString: env.DATABASE_URL })
  const db = drizzle(pool)

  try {
    const hashedPassword = await bcrypt.hash('Mk@123123', SALT_ROUNDS)

    await db.transaction(async (tx) => {
      await tx.execute(sql`
        DO $$
        DECLARE table_names text;
        BEGIN
          SELECT string_agg(format('%I.%I', schemaname, tablename), ', ')
          INTO table_names
          FROM pg_tables
          WHERE schemaname = 'public';

          IF table_names IS NOT NULL THEN
            EXECUTE 'TRUNCATE TABLE ' || table_names || ' RESTART IDENTITY CASCADE';
          END IF;
        END $$;
      `)

      await tx.insert(users).values(seedUsers.map((user) => ({ ...user, password: hashedPassword })))

      await tx.insert(servers).values(seedServers)
      await tx.insert(channels).values(seedChannels)
      await tx.insert(memberships).values(buildMembershipRows())
    })

    console.log('Seed completed successfully.')
    console.log(`Primary user: ${PRIMARY_USER_ID}`)
    console.log('Rule applied: user is owner or member in all generated servers.')
  } finally {
    await pool.end()
  }
}

runSeed().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
