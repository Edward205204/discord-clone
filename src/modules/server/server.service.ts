import { Transactional } from '@nestjs-cls/transactional'
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { ServerRepository } from './server.repo'
import type { CreateInviteBodyType, CreateServerBodyType, UpdateServerBodyType } from './server.model'
import { ServerRole } from 'src/shared/constant/server-role'
import { ChannelService } from '../channel/channel.service'
import { DEFAULT_CHANNEL_NAME } from 'src/shared/constant/default-channel.constant'

@Injectable()
export class ServerService {
  constructor(
    private readonly serverRepository: ServerRepository,
    private readonly channelService: ChannelService,
  ) {}

  private async assertServerOwner(userId: string, serverId: string) {
    const userHandlerData = await this.serverRepository.findMembershipByUserIdAndServerId(userId, serverId)
    if (!userHandlerData || userHandlerData.role !== ServerRole.Owner) {
      throw new ForbiddenException('You cannot perform this action')
    }
  }

  private async assertServerModerator(userId: string, serverId: string) {
    const membership = await this.serverRepository.findMembershipByUserIdAndServerId(userId, serverId)
    if (!membership || (membership.role !== ServerRole.Owner && membership.role !== ServerRole.Moderator)) {
      throw new ForbiddenException('You cannot perform this action')
    }
  }

  async getServerMetadata(userId: string, serverId: string) {
    // TODO: lấy thông tin server (name, owner, member count...)
    const membership = await this.serverRepository.findMembershipByUserIdAndServerId(userId, serverId)
    if (!membership) {
      throw new NotFoundException('You are not a member of this server')
    }

    const server = await this.serverRepository.findServerMetadataByServerId(serverId)

    return server
  }

  async deleteServer(userId: string, serverId: string) {
    // TODO: xóa server (chỉ owner)
    await this.assertServerOwner(userId, serverId)
    await this.serverRepository.deleteServer(serverId)
  }

  async updateServer(userId: string, serverId: string, body: UpdateServerBodyType) {
    // TODO: update server (đổi tên,...)
    await this.assertServerOwner(userId, serverId)

    const updateData = await this.serverRepository.updateServer(serverId, body)
    return {
      serverId: updateData.id,
      name: updateData.name,
      avatar: updateData.avatar,
    }
  }

  async addModerator(userId: string, serverId: string, targetUserId: string) {
    // TODO: thêm mod cho server(server modules).

    if (userId === targetUserId) {
      throw new BadRequestException('You cannot add yourself as a moderator')
    }

    // check user có quyền làm mod không
    const [userHandlerData, targetUserData] = await Promise.all([
      this.serverRepository.findMembershipByUserIdAndServerId(userId, serverId),
      this.serverRepository.findMembershipByUserIdAndServerId(targetUserId, serverId),
    ])

    if (!userHandlerData || userHandlerData.role !== ServerRole.Owner) {
      throw new ForbiddenException('You cannot perform this action')
    }

    if (!targetUserData) {
      throw new NotFoundException('Target user is not a member of this server')
    }

    if (targetUserData.role === ServerRole.Moderator) {
      throw new BadRequestException('Target user is already a moderator')
    }

    const updateData = await this.serverRepository.updateMembershipRole(targetUserId, serverId, ServerRole.Moderator)

    return {
      serverId: updateData.serverId,
      userId: updateData.userId,
      oldRole: targetUserData.role,
      newRole: updateData.role,
    }
  }

  async removeModerator(userId: string, serverId: string, moderatorId: string) {
    // TODO: xóa mod cho server(server modules).
    if (userId === moderatorId) {
      throw new BadRequestException('You are not a moderator')
    }
    const [userHandlerData, moderatorData] = await Promise.all([
      this.serverRepository.findMembershipByUserIdAndServerId(userId, serverId),
      this.serverRepository.findMembershipByUserIdAndServerId(moderatorId, serverId),
    ])

    if (!userHandlerData || userHandlerData.role !== ServerRole.Owner) {
      throw new ForbiddenException('You cannot perform this action')
    }

    if (!moderatorData || moderatorData.role !== ServerRole.Moderator) {
      throw new NotFoundException('Not found moderator')
    }

    const updateData = await this.serverRepository.updateMembershipRole(moderatorId, serverId, ServerRole.Member)

    return {
      serverId: updateData.serverId,
      userId: updateData.userId,
      oldRole: moderatorData.role,
      newRole: updateData.role,
    }
  }

  @Transactional()
  async transferOwnership(userId: string, serverId: string, newOwnerId: string) {
    // TODO: transfer ownership (owner muốn rời server)
    if (userId === newOwnerId) {
      throw new BadRequestException('You cannot transfer ownership to yourself')
    }
    const newOwnerMembershipData = await this.serverRepository.findMembershipByUserIdAndServerId(newOwnerId, serverId)

    if (!newOwnerMembershipData) {
      throw new NotFoundException('New owner is not a member of this server')
    }

    const [serverUpdate, newOwnerUpdateRole, oldOwnerUpdateRole] = await Promise.all([
      this.serverRepository.updateOwnerForServer(userId, newOwnerId, serverId),
      this.serverRepository.updateMembershipRole(newOwnerId, serverId, ServerRole.Owner),
      this.serverRepository.updateMembershipRole(userId, serverId, ServerRole.Moderator),
    ])

    if (!serverUpdate) {
      throw new BadRequestException('Failed to transfer ownership, Server not found or you are not the owner')
    }

    if (!newOwnerUpdateRole || !oldOwnerUpdateRole) {
      throw new BadRequestException('Failed to update new owner role')
    }

    return {
      serverId: serverUpdate.id,
      oldOwnerId: userId,
      newOwnerId: newOwnerId,
    }
  }

  @Transactional()
  async createServer(userId: string, body: CreateServerBodyType) {
    const server = await this.serverRepository.createServer(userId, body)

    const channel = await this.channelService.createChannel(server.id, DEFAULT_CHANNEL_NAME, false)
    if (!channel) throw new BadRequestException('Failed to create default channel')

    await this.serverRepository.createMembership({
      userId,
      role: ServerRole.Owner,
      joinedViaCode: null,
      serverId: server.id,
    })
    return server
  }

  async createInvite(userId: string, serverId: string, body: CreateInviteBodyType) {
    const membership = await this.serverRepository.findMembershipByUserIdAndServerId(userId, serverId)

    if (!membership) {
      // mọi membership trong server đều có khả năng tạo invite
      throw new ForbiddenException('You cannot create an invite for this server')
    }

    const invite = await this.serverRepository.createInvite(userId, serverId, body)
    return {
      code: invite.code,
      expiresAt: invite.expiresAt,
      maxUses: invite.maxUses,
    }
  }

  @Transactional()
  async joinServer(userId: string, code: string) {
    // update use count vào invite và tạo membership cho user
    // khi tạo user khi user đã tồn tại trong server thì throw lỗi -> @Transactional() sẽ rollback transaction
    const invite = await this.serverRepository.updateInviteCount(code)
    if (!invite) throw new BadRequestException('Invite invalid, full or expired')
    const membership = await this.serverRepository.createMembership({
      userId,
      serverId: invite.serverId,
      joinedViaCode: invite.code,
      role: ServerRole.Member,
    })
    if (!membership) throw new ConflictException('Already a member of this server')
    return { serverId: invite.serverId }
  }

  async listMembers(userId: string, serverId: string) {
    // TODO: service thiếu lấy danh sách thành viên trong server(server modules).
    const membership = await this.serverRepository.findMembershipByUserIdAndServerId(userId, serverId)
    if (!membership) {
      throw new NotFoundException('You are not a member of this server')
    }
    const members = await this.serverRepository.findMemberInfoByServerId(serverId)
    return members
  }

  async listInvites(userId: string, serverId: string) {
    await this.assertServerModerator(userId, serverId)
    const invites = await this.serverRepository.findInvitesListJoinWithCreatorByServerId(serverId)
    return invites
  }

  async revokeInvite(userId: string, serverId: string, code: string) {
    await this.assertServerModerator(userId, serverId)
    const invite = await this.serverRepository.updateInviteIsRevoked(code)
    if (!invite) {
      throw new NotFoundException('Invite not found or already revoked')
    }

    return invite
  }

  @Transactional()
  async leaveServerTransaction(userId: string, serverId: string) {
    await this.serverRepository.deleteMembershipByUserIdAndServerId(userId, serverId)
    await this.channelService.deleteChannelMembersByUserId(userId)
  }

  async leaveServer(userId: string, serverId: string) {
    const membership = await this.serverRepository.findMembershipByUserIdAndServerId(userId, serverId)
    if (!membership) {
      throw new NotFoundException('You are not a member of this server')
    }
    if (membership.role === ServerRole.Owner) {
      throw new ForbiddenException('Owner cannot leave server, transfer ownership first')
    }
    await this.leaveServerTransaction(userId, serverId)
  }

  async kickMember(userId: string, serverId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new BadRequestException('You cannot kick yourself')
    }
    const [infoOfHandler, membership] = await Promise.all([
      this.serverRepository.findMembershipByUserIdAndServerId(userId, serverId),
      this.serverRepository.findMembershipByUserIdAndServerId(targetUserId, serverId),
    ])

    if (!infoOfHandler || (infoOfHandler.role !== ServerRole.Owner && infoOfHandler.role !== ServerRole.Moderator)) {
      throw new ForbiddenException('You cannot perform this action')
    }

    if (!membership) {
      throw new NotFoundException('Target user is not a member of this server')
    }

    if (membership.role === ServerRole.Owner) {
      throw new ForbiddenException('You cannot kick the owner')
    }

    if (infoOfHandler.role !== ServerRole.Owner && membership.role === ServerRole.Moderator) {
      throw new ForbiddenException('You cannot kick the moderator if you are not the owner')
    }

    await this.leaveServerTransaction(targetUserId, serverId)
  }

  getMyServerList(userId: string) {
    return this.serverRepository.findServerSummariesByUserId(userId)
  }

  //  -- orchestrator channel service
  async createChannel(userId: string, serverId: string, name: string, isPrivate: boolean) {
    await this.assertServerModerator(userId, serverId)
    const channel = await this.channelService.createChannel(serverId, name, isPrivate)
    if (!channel) throw new BadRequestException('Failed to create channel')
    return channel
  }

  async deleteChannel(userId: string, serverId: string, channelId: string) {
    await this.assertServerModerator(userId, serverId)
    await this.channelService.deleteChannel(channelId, serverId)
  }

  async addMemberToChannel(userId: string, serverId: string, channelId: string, targetUserId: string) {
    await this.assertServerModerator(userId, serverId)
    const channelMember = await this.channelService.addMemberToChannel(channelId, serverId, targetUserId)
    return channelMember
  }

  async removeMemberFromPrivateChannel(userId: string, serverId: string, channelId: string, targetUserId: string) {
    await this.assertServerModerator(userId, serverId)
    await this.channelService.removeMemberFromPrivateChannel(channelId, serverId, targetUserId)
  }

  async updateChannel(userId: string, serverId: string, channelId: string, name: string, isPrivate: boolean) {
    await this.assertServerModerator(userId, serverId)
    const channel = await this.channelService.updateChannel(channelId, serverId, { name, isPrivate })
    return channel
  }
}
