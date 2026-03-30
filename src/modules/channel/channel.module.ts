import { Module } from '@nestjs/common'
import { ChannelController } from './channel.controller'
import { ChannelRepository } from './channel.repo'
import { ChannelService } from './channel.service'

@Module({
  controllers: [ChannelController],
  providers: [ChannelService, ChannelRepository],
  exports: [ChannelService],
})
export class ChannelModule {}
