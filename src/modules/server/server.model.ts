import z from 'zod'
import { ServerRoleType } from 'src/shared/constant/server-role'
import { durationToMs } from 'src/shared/util/duration.util'
import { env } from 'src/shared/infrastructure/config/env.config'

export const CreateServerBody = z
  .object({
    name: z.string().min(3, 'Server name must be at least 3 characters'),
    avatar: z.string().optional(),
  })
  .strict()

export interface CreateMembership {
  userId: string
  role: ServerRoleType
  joinedViaCode: string | null
  serverId: string
}

export const CreateInviteBody = z
  .object({
    expiresAt: durationToMs('expiresAt')
      .transform((ms) => new Date(Date.now() + ms))
      .optional()
      .default(() => new Date(Date.now() + env.DEFAULT_INVITE_EXPIRES_AT)),
    maxUses: z.coerce.number().positive().optional(),
  })
  .strict()

export const ServerIdParam = z
  .object({
    serverId: z.string(),
  })
  .strict()
export const CreateInviteParams = ServerIdParam
export const ListInvitesParams = ServerIdParam
export const RevokeInviteParams = ServerIdParam
export const LeaverServerParams = ServerIdParam
export const KickMemberParams = ServerIdParam.extend({
  targetUserId: z.string(),
})
export const CodeSchema = z
  .object({
    code: z.string(),
  })
  .strict()
export const JoinServerParams = CodeSchema
export const RevokeInviteBody = CodeSchema

export const UpdateServerBody = z.object({
  name: z.string().min(3, 'Server name must be at least 3 characters').optional(),
  avatar: z.string().optional(),
})

export const TransferOwnershipBody = z
  .object({
    newOwnerId: z.string(),
  })
  .strict()

export const TargetUserBody = z
  .object({
    targetUserId: z.string(),
  })
  .strict()

export const ModeratorParams = ServerIdParam.extend({
  moderatorId: z.string(),
}).strict()

export const ChannelParams = ServerIdParam.extend({
  channelId: z.string(),
}).strict()

export const ChannelMemberParams = ChannelParams.extend({
  targetUserId: z.string(),
}).strict()

export const CreateChannelBody = z
  .object({
    name: z.string().min(1, 'Channel name is required'),
    isPrivate: z.boolean(),
  })
  .strict()

export const UpdateChannelBody = z
  .object({
    name: z.string().min(1, 'Channel name is required'),
    isPrivate: z.boolean(),
  })
  .strict()

export type UpdateServerBodyType = z.infer<typeof UpdateServerBody>
export type CreateServerBodyType = z.infer<typeof CreateServerBody>
export type CreateInviteBodyType = z.infer<typeof CreateInviteBody>
export type CreateInviteParamsType = z.infer<typeof CreateInviteParams>
export type JoinServerParamsType = z.infer<typeof JoinServerParams>
export type ListInvitesParamsType = z.infer<typeof ListInvitesParams>
export type RevokeInviteParamsType = z.infer<typeof RevokeInviteParams>
