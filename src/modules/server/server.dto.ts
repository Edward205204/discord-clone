import { createZodDto } from 'nestjs-zod'
import {
  ChannelMemberParams,
  ChannelParams,
  CreateChannelBody,
  CreateInviteBody,
  CreateInviteParams,
  CreateServerBody,
  JoinServerParams,
  KickMemberParams,
  LeaverServerParams,
  ListInvitesParams,
  ModeratorParams,
  RevokeInviteBody,
  RevokeInviteParams,
  ServerIdParam,
  TargetUserBody,
  TransferOwnershipBody,
  UpdateChannelBody,
  UpdateServerBody,
} from './server.model'

export class CreateServerDto extends createZodDto(CreateServerBody) {}
export class CreateInviteDto extends createZodDto(CreateInviteBody) {}
export class CreateInviteParamsDto extends createZodDto(CreateInviteParams) {}
export class JoinServerParamsDto extends createZodDto(JoinServerParams) {}
export class ListInvitesParamsDto extends createZodDto(ListInvitesParams) {}
export class RevokeInviteParamsDto extends createZodDto(RevokeInviteParams) {}
export class RevokeInviteDto extends createZodDto(RevokeInviteBody) {}
export class LeaverServerParamsDto extends createZodDto(LeaverServerParams) {}
export class KickMemberParamsDto extends createZodDto(KickMemberParams) {}
export class ServerIdParamsDto extends createZodDto(ServerIdParam) {}
export class UpdateServerDto extends createZodDto(UpdateServerBody) {}
export class AddModeratorDto extends createZodDto(TargetUserBody) {}
export class RemoveModeratorParamsDto extends createZodDto(ModeratorParams) {}
export class TransferOwnershipDto extends createZodDto(TransferOwnershipBody) {}
export class ListMembersParamsDto extends createZodDto(ServerIdParam) {}
export class CreateChannelDto extends createZodDto(CreateChannelBody) {}
export class ChannelParamsDto extends createZodDto(ChannelParams) {}
export class AddMemberToChannelDto extends createZodDto(TargetUserBody) {}
export class RemoveMemberFromChannelParamsDto extends createZodDto(ChannelMemberParams) {}
export class UpdateChannelDto extends createZodDto(UpdateChannelBody) {}
