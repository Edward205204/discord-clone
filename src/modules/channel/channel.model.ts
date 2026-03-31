import z from 'zod'

export const ChannelServerIdParams = z
  .object({
    serverId: z.string(),
  })
  .strict()

export const ChannelMembersParams = z
  .object({
    channelId: z.string(),
    serverId: z.string(),
  })
  .strict()

export type ChannelServerIdParamsType = z.infer<typeof ChannelServerIdParams>
export type ChannelMembersParamsType = z.infer<typeof ChannelMembersParams>
