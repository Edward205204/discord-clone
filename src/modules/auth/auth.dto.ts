import { createZodDto } from 'nestjs-zod'
import { LoginBody, RegisterBody, SendRegistrationVerificationBody } from './auth.model'

export class RegisterDto extends createZodDto(RegisterBody) {}

export class LoginDto extends createZodDto(LoginBody) {}

export class SendRegistrationVerificationDto extends createZodDto(SendRegistrationVerificationBody) {}
