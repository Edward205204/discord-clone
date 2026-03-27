import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './modules/auth/auth.module'
import { DatabaseModule } from './shared/infrastructure/database/database.module'

const SharedModules = [DatabaseModule]
@Module({
  imports: [AuthModule, ...SharedModules],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
