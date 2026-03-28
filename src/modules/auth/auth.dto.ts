import { createZodDto } from 'nestjs-zod'
import { LoginBody, RegisterBody } from './auth.model'

export class RegisterDto extends createZodDto(RegisterBody) {}

export class LoginDto extends createZodDto(LoginBody) {}
