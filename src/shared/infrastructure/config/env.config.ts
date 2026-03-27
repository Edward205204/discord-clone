import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import envSchema from './env.schema'

const envPath = path.resolve(process.cwd(), '.env')

if (!fs.existsSync(envPath)) {
  console.error('❌ Không tìm thấy file .env tại:', envPath)
  process.exit(1)
}

dotenv.config({ path: envPath })

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Biến môi trường không hợp lệ:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
