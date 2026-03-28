import ms from 'ms'
import z from 'zod'

function parseDurationToMs(value: string): number | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const n = ms(trimmed as Parameters<typeof ms>[0])
  return typeof n === 'number' && Number.isFinite(n) ? n : undefined
}

const durationToMs = (name: string) =>
  z
    .string()
    .trim()
    .min(1)
    .refine(
      (val) => {
        const n = parseDurationToMs(val)
        return n !== undefined && n > 0
      },
      { message: `${name} phải là khoảng thời gian hợp lệ (vd: 30s, 5m, 3h, 7d)` },
    )
    .transform((val) => parseDurationToMs(val) as number)

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
})

export default envSchema
