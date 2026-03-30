import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common'
import { ServerService } from './server.service'
import { ApiBearerAuth } from '@nestjs/swagger'
import { ActiveUser } from 'src/shared/common/decorators/active-user.decorator'
import type TokenPayload from 'src/shared/types/token.payload'
import {
  CreateInviteDto,
  CreateInviteParamsDto,
  CreateServerDto,
  JoinServerParamsDto,
  KickMemberParamsDto,
  LeaverServerParamsDto,
  ListInvitesParamsDto,
  RevokeInviteDto,
  RevokeInviteParamsDto,
} from './server.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateInviteResponse,
  CreateServerResponse,
  GetMyServerListResponse,
  JoinServerResponse,
  ListInvitesResponse,
} from './server.serialize'

@Controller('server')
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

  @Post('create')
  @ApiBearerAuth('access-token')
  @ZodSerializerDto(CreateServerResponse)
  createServer(@ActiveUser() user: TokenPayload, @Body() body: CreateServerDto) {
    return this.serverService.createServer(user.userId, body)
  }

  @Post('/:serverId/invites')
  @ApiBearerAuth('access-token')
  @ZodSerializerDto(CreateInviteResponse)
  createInvite(
    @ActiveUser() user: TokenPayload,
    @Param() params: CreateInviteParamsDto,
    @Body() body: CreateInviteDto,
  ) {
    return this.serverService.createInvite(user.userId, params.serverId, body)
  }

  @Post('join/:code')
  @ApiBearerAuth('access-token')
  @ZodSerializerDto(JoinServerResponse)
  joinServer(@ActiveUser() user: TokenPayload, @Param() params: JoinServerParamsDto) {
    return this.serverService.joinServer(user.userId, params.code)
  }

  @Get('/:serverId/invites')
  @ApiBearerAuth('access-token')
  @ZodSerializerDto(ListInvitesResponse)
  listInvites(@ActiveUser() user: TokenPayload, @Param() params: ListInvitesParamsDto) {
    return this.serverService.listInvites(user.userId, params.serverId)
  }

  @Patch('/:serverId/invites/revoke')
  @ApiBearerAuth('access-token')
  revokeInvite(
    @ActiveUser() user: TokenPayload,
    @Param() params: RevokeInviteParamsDto,
    @Body() body: RevokeInviteDto,
  ) {
    return this.serverService.revokeInvite(user.userId, params.serverId, body.code)
  }

  @Delete('/:serverId/members/me')
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  leaveServer(@ActiveUser() user: TokenPayload, @Param() params: LeaverServerParamsDto) {
    return this.serverService.leaveServer(user.userId, params.serverId)
  }

  @Delete('/:serverId/members/:targetUserId')
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  kickMember(@ActiveUser() user: TokenPayload, @Param() params: KickMemberParamsDto) {
    return this.serverService.kickMember(user.userId, params.serverId, params.targetUserId)
  }

  @Get('me')
  @ApiBearerAuth('access-token')
  @ZodSerializerDto(GetMyServerListResponse)
  getMyServerList(@ActiveUser() user: TokenPayload) {
    return this.serverService.getMyServerList(user.userId)
  }
}
