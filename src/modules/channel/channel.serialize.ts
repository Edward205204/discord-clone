import z from 'zod'

export const ChannelListResponse = z.array(
  z.object({
    channelId: z.string(),
    channelName: z.string(),
    isPrivate: z.boolean(),
  }),
)

export const ChannelMembersResponse = z.array(
  z.object({
    userId: z.string(),
    userName: z.string(),
    avatar: z.string(),
    joinedAt: z.date(),
  }),
)
