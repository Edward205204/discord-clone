import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { ChannelRepository } from './channel.repo'

@Injectable()
export class ChannelService {
  constructor(private readonly channelRepository: ChannelRepository) {}

  // internal - dùng bởi server service
  deleteChannelMembersByUserId(userId: string) {
    return this.channelRepository.deleteChannelMembersByUserId(userId)
  }

  createChannel(serverId: string, name: string, isPrivate: boolean, isDefault?: boolean) {
    // 1. Tạo channel, chỉ có owner hoặc mode mới có quyền, tạm mod chưa được thêm, sau này làm kĩ rbac sau.
    return this.channelRepository.createChannel(serverId, name, isPrivate, isDefault)
  }

  async deleteChannel(channelId: string, serverId: string) {
    // 2. xóa channel, owner được xóa, mod sau này rbac sau
    const deleteData = await this.channelRepository.deleteChannelByIdAndServerId(channelId, serverId)
    if (!deleteData) throw new NotFoundException('Channel not found')
    return deleteData
  }

  async checkChannelMemberPrivate(channelId: string, serverId: string) {
    const channel = await this.channelRepository.findChannelByIdAndServerId(channelId, serverId)

    if (!channel) throw new NotFoundException('Channel not found')

    if (!channel.isPrivate) throw new BadRequestException('This channel is not private')
  }

  async addMemberToChannel(channelId: string, serverId: string, targetUserId: string) {
    // 3. thêm member vào channel private(table channelMembers)

    await this.checkChannelMemberPrivate(channelId, serverId)

    const channelMember = await this.channelRepository.insertChannelMembers(channelId, targetUserId)
    if (!channelMember) throw new ConflictException('Failed to add member to channel')
    return channelMember
  }

  async removeMemberFromPrivateChannel(channelId: string, serverId: string, targetUserId: string) {
    // 4. xóa member khỏi channel private(table channelMembers)
    await this.checkChannelMemberPrivate(channelId, serverId)
    const deletedData = await this.channelRepository.deleteChannelMemberByUserIdAndChannelId(targetUserId, channelId)

    if (!deletedData) throw new NotFoundException('Member not found in channel')
  }

  async getChannelListForUser(userId: string, serverId: string) {
    // 6. lấy danh sách channel phù hợp dựa vào userId
    //  public route riêng
    const privateChannels = await this.channelRepository.findChannelMembershipsWithChannelByUserIdAndServerId(
      userId,
      serverId,
    )

    const publicChannels = await this.channelRepository.findChannelsPublicWithMembershipsByServerIdAndUserId(
      userId,
      serverId,
    )

    const channelList = [...privateChannels, ...publicChannels]
    return channelList
  }

  async getMembersOfPrivateChannel(userId, channelId: string, serverId: string) {
    // 7. lấy danh sách member của channel private(table channelMembers)
    //  public route riêng
    const isMember = await this.channelRepository.findChannelMemberByUserIdAndChannelId(userId, channelId)
    if (!isMember) throw new ForbiddenException('You are not a member of this channel')

    await this.checkChannelMemberPrivate(channelId, serverId)
    const members = await this.channelRepository.findMembershipsInChannelWithUserByChannelId(channelId)
    return members
  }

  async updateChannel(channelId: string, serverId: string, payload: { name?: string; isPrivate?: boolean }) {
    // 8. Update channel (đổi tên, đổi public/private)
    //  check quyền ở tầng server

    const updatedChannel = await this.channelRepository.updateChannel(channelId, serverId, payload)
    if (!updatedChannel) throw new NotFoundException('Failed to update channel')
    return updatedChannel
  }
}
