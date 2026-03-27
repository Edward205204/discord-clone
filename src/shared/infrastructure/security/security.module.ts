import { Module } from '@nestjs/common'
import { TokenService } from './token.service'
import { HashingService } from './hashing.service'
import { JwtModule } from '@nestjs/jwt'

@Module({
  providers: [TokenService, HashingService],
  imports: [JwtModule],
  exports: [TokenService, HashingService],
})
export class SecurityModule {}
