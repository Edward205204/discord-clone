import { Module } from '@nestjs/common'
import { AuthModule } from './modules/auth/auth.module'
import { DatabaseModule } from './shared/infrastructure/database/database.module'

const SharedModules = [DatabaseModule]
@Module({
  imports: [AuthModule, ...SharedModules],
  providers: [],
})
export class AppModule {}
