import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { IsPublic } from 'src/shared/common/decorators/auth.decorator'
import { AuthService } from './auth.service'
import { LoginDto, LogoutDto, RegisterDto, SendRegistrationVerificationDto } from './auth.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { AuthResponse, MessageResponse } from './auth.serialize'

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
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(MessageResponse)
  logout(@Body() body: LogoutDto) {
    return this.authService.logout(body)
  }
}
