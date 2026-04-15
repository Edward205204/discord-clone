import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common'
import { ServerService } from './server.service'
import { ApiBearerAuth } from '@nestjs/swagger'
import { ActiveUser } from 'src/shared/common/decorators/active-user.decorator'
import type TokenPayload from 'src/shared/types/token.payload'
import {
  AddMemberToChannelDto,
  AddModeratorDto,
  ChannelParamsDto,
  CreateChannelDto,
  CreateInviteDto,
  CreateInviteParamsDto,
  CreateServerDto,
  JoinServerParamsDto,
  KickMemberParamsDto,
  LeaverServerParamsDto,
  ListMembersParamsDto,
  ListInvitesParamsDto,
  RemoveMemberFromChannelParamsDto,
  RemoveModeratorParamsDto,
  RevokeInviteDto,
  RevokeInviteParamsDto,
  ServerIdParamsDto,
  TransferOwnershipDto,
  UpdateChannelDto,
  UpdateServerDto,
} from './server.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  ChannelMemberResponse,
  ChannelResponse,
  CreateInviteResponse,
  CreateServerResponse,
  GetMyServerListResponse,
  JoinServerResponse,
  ListMembersResponse,
  ListInvitesResponse,
  RevokeInviteResponse,
  RoleUpdateResponse,
  ServerMetadataResponse,
  TransferOwnershipResponse,
  UpdateServerResponse,
} from './server.serialize'

@Controller('server')
@ApiBearerAuth('access-token')
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

  @Post('create')
  @ZodSerializerDto(CreateServerResponse)
  createServer(@ActiveUser() user: TokenPayload, @Body() body: CreateServerDto) {
    return this.serverService.createServer(user.userId, body)
  }

  @Post('/:serverId/invites')
  @ZodSerializerDto(CreateInviteResponse)
  createInvite(
    @ActiveUser() user: TokenPayload,
    @Param() params: CreateInviteParamsDto,
    @Body() body: CreateInviteDto,
  ) {
    return this.serverService.createInvite(user.userId, params.serverId, body)
  }

  @Post('join/:code')
  @ZodSerializerDto(JoinServerResponse)
  joinServer(@ActiveUser() user: TokenPayload, @Param() params: JoinServerParamsDto) {
    return this.serverService.joinServer(user.userId, params.code)
  }

  @Get('list')
  @ZodSerializerDto(GetMyServerListResponse)
  getMyServerList(@ActiveUser() user: TokenPayload) {
    return this.serverService.getMyServerList(user.userId)
  }

  @Get(':serverId')
  @ZodSerializerDto(ServerMetadataResponse)
  getServerMetadata(@ActiveUser() user: TokenPayload, @Param() params: ServerIdParamsDto) {
    return this.serverService.getServerMetadata(user.userId, params.serverId)
  }

  @Patch(':serverId')
  @ZodSerializerDto(UpdateServerResponse)
  updateServer(@ActiveUser() user: TokenPayload, @Param() params: ServerIdParamsDto, @Body() body: UpdateServerDto) {
    return this.serverService.updateServer(user.userId, params.serverId, body)
  }

  @Delete(':serverId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteServer(@ActiveUser() user: TokenPayload, @Param() params: ServerIdParamsDto) {
    return this.serverService.deleteServer(user.userId, params.serverId)
  }

  @Post(':serverId/moderators')
  @ZodSerializerDto(RoleUpdateResponse)
  addModerator(@ActiveUser() user: TokenPayload, @Param() params: ServerIdParamsDto, @Body() body: AddModeratorDto) {
    return this.serverService.addModerator(user.userId, params.serverId, body.targetUserId)
  }

  @Delete(':serverId/moderators/:moderatorId')
  @ZodSerializerDto(RoleUpdateResponse)
  removeModerator(@ActiveUser() user: TokenPayload, @Param() params: RemoveModeratorParamsDto) {
    return this.serverService.removeModerator(user.userId, params.serverId, params.moderatorId)
  }

  @Patch(':serverId/ownership')
  @ZodSerializerDto(TransferOwnershipResponse)
  transferOwnership(
    @ActiveUser() user: TokenPayload,
    @Param() params: ServerIdParamsDto,
    @Body() body: TransferOwnershipDto,
  ) {
    return this.serverService.transferOwnership(user.userId, params.serverId, body.newOwnerId)
  }

  @Get(':serverId/members')
  @ZodSerializerDto(ListMembersResponse)
  listMembers(@ActiveUser() user: TokenPayload, @Param() params: ListMembersParamsDto) {
    return this.serverService.listMembers(user.userId, params.serverId)
  }

  @Get('/:serverId/invites')
  @ZodSerializerDto(ListInvitesResponse)
  listInvites(@ActiveUser() user: TokenPayload, @Param() params: ListInvitesParamsDto) {
    return this.serverService.listInvites(user.userId, params.serverId)
  }

  @Patch('/:serverId/invites/revoke')
  @ZodSerializerDto(RevokeInviteResponse)
  revokeInvite(
    @ActiveUser() user: TokenPayload,
    @Param() params: RevokeInviteParamsDto,
    @Body() body: RevokeInviteDto,
  ) {
    return this.serverService.revokeInvite(user.userId, params.serverId, body.code)
  }

  @Delete('/:serverId/members/me')
  @HttpCode(HttpStatus.NO_CONTENT)
  leaveServer(@ActiveUser() user: TokenPayload, @Param() params: LeaverServerParamsDto) {
    return this.serverService.leaveServer(user.userId, params.serverId)
  }

  @Delete('/:serverId/members/:targetUserId')
  @HttpCode(HttpStatus.NO_CONTENT)
  kickMember(@ActiveUser() user: TokenPayload, @Param() params: KickMemberParamsDto) {
    return this.serverService.kickMember(user.userId, params.serverId, params.targetUserId)
  }

  @Post(':serverId/channels')
  @ZodSerializerDto(ChannelResponse)
  createChannel(@ActiveUser() user: TokenPayload, @Param() params: ServerIdParamsDto, @Body() body: CreateChannelDto) {
    return this.serverService.createChannel(user.userId, params.serverId, body.name, body.isPrivate)
  }

  @Patch(':serverId/channels/:channelId')
  @ZodSerializerDto(ChannelResponse)
  updateChannel(@ActiveUser() user: TokenPayload, @Param() params: ChannelParamsDto, @Body() body: UpdateChannelDto) {
    return this.serverService.updateChannel(user.userId, params.serverId, params.channelId, body.name, body.isPrivate)
  }

  @Delete(':serverId/channels/:channelId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteChannel(@ActiveUser() user: TokenPayload, @Param() params: ChannelParamsDto) {
    return this.serverService.deleteChannel(user.userId, params.serverId, params.channelId)
  }

  @Post(':serverId/channels/:channelId/members')
  @ZodSerializerDto(ChannelMemberResponse)
  addMemberToChannel(
    @ActiveUser() user: TokenPayload,
    @Param() params: ChannelParamsDto,
    @Body() body: AddMemberToChannelDto,
  ) {
    return this.serverService.addMemberToChannel(user.userId, params.serverId, params.channelId, body.targetUserId)
  }

  @Delete(':serverId/channels/:channelId/members/:targetUserId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMemberFromPrivateChannel(@ActiveUser() user: TokenPayload, @Param() params: RemoveMemberFromChannelParamsDto) {
    return this.serverService.removeMemberFromPrivateChannel(
      user.userId,
      params.serverId,
      params.channelId,
      params.targetUserId,
    )
  }
}
