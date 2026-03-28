import { createZodDto } from 'nestjs-zod'
import {
  LoginBody,
  LogoutBody,
  RefreshTokenBody,
  RegisterBody,
  ResetPasswordBody,
  SendRegistrationVerificationBody,
  SendResetPasswordVerificationBody,
} from './auth.model'

export class RegisterDto extends createZodDto(RegisterBody) {}

export class LoginDto extends createZodDto(LoginBody) {}

export class SendRegistrationVerificationDto extends createZodDto(SendRegistrationVerificationBody) {}

export class SendResetPasswordVerificationDto extends createZodDto(SendResetPasswordVerificationBody) {}

export class ResetPasswordDto extends createZodDto(ResetPasswordBody) {}

export class LogoutDto extends createZodDto(LogoutBody) {}

export class RefreshTokenDto extends createZodDto(RefreshTokenBody) {}
