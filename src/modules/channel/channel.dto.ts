import { createZodDto } from 'nestjs-zod'
import { ChannelServerIdParams, ChannelMembersParams } from './channel.model'

export class ChannelServerIdParamsDto extends createZodDto(ChannelServerIdParams) {}
export class ChannelMembersParamsDto extends createZodDto(ChannelMembersParams) {}
