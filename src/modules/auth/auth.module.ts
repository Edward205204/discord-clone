import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { SecurityModule } from 'src/shared/infrastructure/security/security.module'
import { AuthRepository } from './auth.repo'

@Module({
  imports: [SecurityModule],
  providers: [AuthService, AuthRepository],
  controllers: [AuthController],
})
export class AuthModule {}
