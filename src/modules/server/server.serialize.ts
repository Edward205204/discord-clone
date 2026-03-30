import z from 'zod'

export const CreateServerResponse = z.object({
  id: z.string('ID is required'),
  name: z.string('Name is required'),
  ownerId: z.string('Owner ID is required'),
  createdAt: z.date('Created at is required'),
})

export const CreateInviteResponse = z.object({
  code: z.string('Code is required'),
  expiresAt: z.date('Expires at is required'),
  maxUses: z.number('Max uses is required'),
})

export const JoinServerResponse = z.object({
  serverId: z.string('Server ID is required'),
})

export const ListInvitesResponse = z.object({
  id: z.string('ID is required'),
  code: z.string('Code is required'),
  expiresAt: z.date('Expires at is required'),
  maxUses: z.number('Max uses is required'),
  useCount: z.number('Use count is required'),
  isRevoked: z.boolean('Is revoked is required'),
  createdAt: z.date('Created at is required'),
  creatorAvatar: z.string('Creator avatar is required'),
  creatorUserName: z.string('Creator user name is required'),
})

export const GetMyServerListResponse = z.array(
  z.object({
    serverId: z.string('Server ID is required'),
    serverName: z.string('Server name is required'),
  }),
)
