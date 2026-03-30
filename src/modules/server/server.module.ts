import { Module } from '@nestjs/common'
import { ServerController } from './server.controller'
import { ServerService } from './server.service'
import { ServerRepository } from './server.repo'

@Module({
  controllers: [ServerController],
  providers: [ServerService, ServerRepository],
})
export class ServerModule {}
