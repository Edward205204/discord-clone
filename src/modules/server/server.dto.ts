import { createZodDto } from 'nestjs-zod'
import {
  CreateInviteBody,
  CreateInviteParams,
  CreateServerBody,
  JoinServerParams,
  ListInvitesParams,
  RevokeInviteBody,
  RevokeInviteParams,
  LeaverServerParams,
  KickMemberParams,
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
