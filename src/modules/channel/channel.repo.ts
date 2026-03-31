import { TransactionHost } from '@nestjs-cls/transactional'
import { Injectable } from '@nestjs/common'
import { MyDrizzleAdapter } from 'src/shared/infrastructure/database/database.types'
import { channelMembers, channels } from './channel.schema'
import { and, desc, eq } from 'drizzle-orm'
import { users } from '../user/user.schema'

@Injectable()
export class ChannelRepository {
  constructor(private readonly txHost: TransactionHost<MyDrizzleAdapter>) {}

  async deleteChannelMembersByUserId(userId: string) {
    await this.txHost.tx.delete(channelMembers).where(eq(channelMembers.userId, userId))
  }

  async createChannel(serverId: string, name: string, isPrivate: boolean) {
    const [channel] = await this.txHost.tx.insert(channels).values({ serverId, name, isPrivate }).returning()

    return channel
  }

  async deleteChannelByIdAndServerId(channelId: string, serverId: string) {
    const [deletedData] = await this.txHost.tx
      .delete(channels)
      .where(and(eq(channels.id, channelId), eq(channels.serverId, serverId)))
      .returning()

    return deletedData
  }

  async insertChannelMembers(channelId: string, userId: string) {
    const [channelMember] = await this.txHost.tx
      .insert(channelMembers)
      .values({ channelId, userId })
      .onConflictDoNothing()
      .returning()
    return channelMember
  }

  async findChannelByIdAndServerId(channelId: string, serverId: string) {
    const [channel] = await this.txHost.tx
      .select()
      .from(channels)
      .where(and(eq(channels.id, channelId), eq(channels.serverId, serverId)))
      .limit(1)
    return channel
  }

  async deleteChannelMemberByUserIdAndChannelId(userId, channelId) {
    const [deletedData] = await this.txHost.tx
      .delete(channelMembers)
      .where(and(eq(channelMembers.userId, userId), eq(channelMembers.channelId, channelId)))
      .returning()
    return deletedData
  }

  async findChannelMembershipsWithChannelByUserIdAndServerId(userId: string, serverId: string) {
    const privateChannels = await this.txHost.tx
      .select({ channelId: channelMembers.channelId, channelName: channels.name, isPrivate: channels.isPrivate })
      .from(channelMembers)
      .innerJoin(channels, eq(channelMembers.channelId, channels.id))
      .where(and(eq(channelMembers.userId, userId), eq(channels.serverId, serverId)))
      .orderBy(desc(channelMembers.addedAt))
    return privateChannels
  }

  async findChannelsPublicByServerId(serverId: string) {
    const publicChannels = await this.txHost.tx
      .select({ channelId: channels.id, channelName: channels.name, isPrivate: channels.isPrivate })
      .from(channels)
      .where(and(eq(channels.serverId, serverId), eq(channels.isPrivate, false)))
      .orderBy(desc(channels.createdAt))
    return publicChannels
  }

  async findMembershipsInChannelWithUserByChannelId(channelId: string) {
    const membersOfPrivateChannel = await this.txHost.tx
      .select({
        userId: channelMembers.userId,
        userName: users.userName,
        avatar: users.avatar,
        joinedAt: channelMembers.addedAt,
      })
      .from(channelMembers)
      .innerJoin(users, eq(channelMembers.userId, users.id))
      .where(eq(channelMembers.channelId, channelId))
      .orderBy(desc(channelMembers.addedAt))
    return membersOfPrivateChannel
  }

  async findChannelMemberByUserIdAndChannelId(userId: string, channelId: string) {
    const [channelMember] = await this.txHost.tx
      .select()
      .from(channelMembers)
      .where(and(eq(channelMembers.userId, userId), eq(channelMembers.channelId, channelId)))
      .limit(1)
    return channelMember
  }

  async updateChannel(channelId: string, serverId: string, payload: { name?: string; isPrivate?: boolean }) {
    const [updatedChannel] = await this.txHost.tx
      .update(channels)
      .set({ ...payload })
      .where(and(eq(channels.id, channelId), eq(channels.serverId, serverId)))
      .returning()
    return updatedChannel
  }
}
