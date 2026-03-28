import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { IsPublic } from 'src/shared/common/decorators/auth.decorator'
import { AuthService } from './auth.service'
import {
  LoginDto,
  LogoutDto,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto,
  SendRegistrationVerificationDto,
  SendResetPasswordVerificationDto,
} from './auth.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { AuthResponse, MessageResponse, RefreshTokenResponse } from './auth.serialize'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @Post('register/verification-code')
  @ZodSerializerDto(MessageResponse)
  sendRegistrationVerificationCode(@Body() body: SendRegistrationVerificationDto) {
    return this.authService.sendRegistrationVerificationCode(body)
  }

  @IsPublic()
  @Post('register')
  @ZodSerializerDto(AuthResponse)
  register(@Body() body: RegisterDto) {
    return this.authService.register(body)
  }

  @IsPublic()
  @Post('login')
  @ZodSerializerDto(AuthResponse)
  login(@Body() body: LoginDto) {
    return this.authService.login(body)
  }

  @IsPublic()
  @Post('reset-password/verification-code')
  @ZodSerializerDto(MessageResponse)
  sendResetPasswordVerificationCode(@Body() body: SendResetPasswordVerificationDto) {
    return this.authService.sendResetPasswordVerificationCode(body)
  }

  @IsPublic()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(MessageResponse)
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body)
  }

  @IsPublic()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(MessageResponse)
  logout(@Body() body: LogoutDto) {
    return this.authService.logout(body)
  }

  @Post('refresh-token')
  @IsPublic()
  @ZodSerializerDto(RefreshTokenResponse)
  refreshToken(@Body() body: RefreshTokenDto) {
    return this.authService.refreshToken(body)
  }
}
