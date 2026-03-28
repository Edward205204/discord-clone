import { Body, Controller, Post } from '@nestjs/common'
import { IsPublic } from 'src/shared/common/decorators/auth.decorator'
import { AuthService } from './auth.service'
import { LoginDto, RegisterDto } from './auth.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { AuthResponse } from './auth.serialize'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
