import { ChannelService } from './channel.service'
import { Controller, Get, Param } from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import { ActiveUser } from 'src/shared/common/decorators/active-user.decorator'
import type TokenPayload from 'src/shared/types/token.payload'
import { ChannelServerIdParamsDto, ChannelMembersParamsDto } from './channel.dto'
import { ChannelListResponse, ChannelMembersResponse } from './channel.serialize'

@Controller('channel')
@ApiBearerAuth('access-token')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Get('server/:serverId')
  @ZodSerializerDto(ChannelListResponse)
  getChannelList(@ActiveUser() user: TokenPayload, @Param() params: ChannelServerIdParamsDto) {
    return this.channelService.getChannelListForUser(user.userId, params.serverId)
  }
  @Get(':channelId/server/:serverId/members')
  @ZodSerializerDto(ChannelMembersResponse)
  getMembersOfPrivateChannel(@ActiveUser() user: TokenPayload, @Param() params: ChannelMembersParamsDto) {
    return this.channelService.getMembersOfPrivateChannel(user.userId, params.channelId, params.serverId)
  }
}
