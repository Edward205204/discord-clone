import z from 'zod'

export const CreateServerResponse = z.object({
  id: z.string('ID is required'),
  name: z.string('Name is required'),
  ownerId: z.string('Owner ID is required'),
  createdAt: z.date('Created at is required'),
})

export const CreateInviteResponse = z.object({
  code: z.string('Code is required'),
  expiresAt: z.date('Expires at is required').nullable(),
  maxUses: z.number('Max uses is required').nullable(),
})

export const JoinServerResponse = z.object({
  serverId: z.string('Server ID is required'),
})

export const ListInvitesResponse = z.object({
  id: z.string('ID is required'),
  code: z.string('Code is required'),
  expiresAt: z.date('Expires at is required').nullable(),
  maxUses: z.number('Max uses is required').nullable(),
  useCount: z.number('Use count is required'),
  isRevoked: z.boolean('Is revoked is required'),
  createdAt: z.date('Created at is required'),
  creatorAvatar: z.string('Creator avatar is required').nullable(),
  creatorUserName: z.string('Creator user name is required'),
})

export const GetMyServerListResponse = z.array(
  z.object({
    serverId: z.string('Server ID is required'),
    serverName: z.string('Server name is required'),
    serverAvatar: z.string('Server avatar is required').nullable(),
    defaultChannel: z
      .object({
        channelId: z.string('Channel ID is required'),
        channelName: z.string('Channel name is required'),
      })
      .nullable(),
  }),
)

export const ServerMetadataResponse = z.object({
  id: z.string('ID is required'),
  name: z.string('Name is required'),
  avatar: z.string('Avatar is required').nullable(),
  ownerId: z.string('Owner ID is required'),
  ownerUserName: z.string('Owner user name is required'),
  ownerAvatar: z.string('Owner avatar is required').nullable(),
  memberCount: z.number('Member count is required'),
})

export const UpdateServerResponse = z.object({
  serverId: z.string('Server ID is required'),
  name: z.string('Name is required'),
  avatar: z.string('Avatar is required').nullable(),
})

export const RoleUpdateResponse = z.object({
  serverId: z.string('Server ID is required'),
  userId: z.string('User ID is required'),
  oldRole: z.string('Old role is required'),
  newRole: z.string('New role is required'),
})

export const TransferOwnershipResponse = z.object({
  serverId: z.string('Server ID is required'),
  oldOwnerId: z.string('Old owner ID is required'),
  newOwnerId: z.string('New owner ID is required'),
})

export const ListMembersResponse = z.array(
  z.object({
    userId: z.string('User ID is required'),
    userName: z.string('User name is required'),
    userAvatar: z.string('User avatar is required').nullable(),
    role: z.string('Role is required'),
  }),
)

export const RevokeInviteResponse = z.object({
  id: z.string('ID is required'),
  serverId: z.string('Server ID is required'),
  createdBy: z.string('Created by is required'),
  code: z.string('Code is required'),
  expiresAt: z.date('Expires at is required').nullable(),
  maxUses: z.number('Max uses is required').nullable(),
  useCount: z.number('Use count is required'),
  isRevoked: z.boolean('Is revoked is required'),
  createdAt: z.date('Created at is required'),
})

export const ChannelResponse = z.object({
  id: z.string('ID is required'),
  serverId: z.string('Server ID is required'),
  name: z.string('Name is required'),
  isPrivate: z.boolean('isPrivate is required'),
  createdAt: z.date('Created at is required'),
})

export const ChannelMemberResponse = z.object({
  channelId: z.string('Channel ID is required'),
  userId: z.string('User ID is required'),
  addedAt: z.date('Added at is required'),
})
