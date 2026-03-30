import z from 'zod'
import { durationToMs } from 'src/shared/util/duration.util'

const envSchema = z.object({
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  DATABASE_URL: z.string(),
  MONGO_URI: z.string(),
  MONGO_INITDB_ROOT_USERNAME: z.string(),
  MONGO_INITDB_ROOT_PASSWORD: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string(),
  APP_PORT: z.coerce.number(),
  SECRET_API_KEY: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),

  OTP_TTL_MS: durationToMs('OTP_TTL_MS'),
  OTP_BUFFER_MS: durationToMs('OTP_BUFFER_MS'),
  OTP_LENGTH: z.coerce.number(),
  DEFAULT_INVITE_EXPIRES_AT: durationToMs('DEFAULT_INVITE_EXPIRES_AT'),
})

export default envSchema
