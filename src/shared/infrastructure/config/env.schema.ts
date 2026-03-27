import z from 'zod'

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
})

export default envSchema
