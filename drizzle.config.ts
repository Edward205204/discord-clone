// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'
import { env } from './src/shared/infrastructure/config/env.config'

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/shared/infrastructure/database/schema.ts',
  out: './drizzle/migrations',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
})
