import { Module } from '@nestjs/common'
import { ServerController } from './server.controller'
import { ServerService } from './server.service'
import { ServerRepository } from './server.repo'
import { ChannelModule } from '../channel/channel.module'

@Module({
  controllers: [ServerController],
  providers: [ServerService, ServerRepository],
  imports: [ChannelModule],
})
export class ServerModule {}
