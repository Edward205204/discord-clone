import { Transactional } from '@nestjs-cls/transactional'
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { ServerRepository } from './server.repo'
import type { CreateInviteBodyType, CreateServerBodyType } from './server.model'
import { ServerRole } from 'src/shared/constant/server-role'

@Injectable()
export class ServerService {
  constructor(private readonly serverRepository: ServerRepository) {}

  @Transactional()
  async createServer(userId: string, body: CreateServerBodyType) {
    const server = await this.serverRepository.createServer(userId, body)
    //  sau này tạo default channel cho server ở đây.
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

  private async assertServerModerator(userId: string, serverId: string) {
    const membership = await this.serverRepository.findMembershipByUserIdAndServerId(userId, serverId)
    if (!membership || (membership.role !== ServerRole.Owner && membership.role !== ServerRole.Moderator)) {
      throw new ForbiddenException('You cannot perform this action')
    }
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
    await this.serverRepository.deleteChannelMembersByUserId(userId)
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
}
