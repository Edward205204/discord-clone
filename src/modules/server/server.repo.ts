import { TransactionHost } from '@nestjs-cls/transactional'
import { Injectable } from '@nestjs/common'
import { MyDrizzleAdapter } from 'src/shared/infrastructure/database/database.types'
import { CreateInviteBodyType, CreateMembership, CreateServerBodyType, UpdateServerBodyType } from './server.model'
import { memberships, serverInvites, servers } from './server.schema'
import { nanoid } from 'nanoid'
import { and, count, desc, eq, gt, isNull, lt, or, sql } from 'drizzle-orm'
import { users } from '../user/user.schema'
import { ServerRoleType } from 'src/shared/constant/server-role'

@Injectable()
export class ServerRepository {
  constructor(private readonly txHost: TransactionHost<MyDrizzleAdapter>) {}

  async findMembershipByUserIdAndServerId(userId: string, serverId: string) {
    const [membership] = await this.txHost.tx
      .select({ userId: memberships.userId, role: memberships.role })
      .from(memberships)
      .where(and(eq(memberships.userId, userId), eq(memberships.serverId, serverId)))
      .limit(1)
    return membership
  }

  async updateOwnerForServer(userId: string, newOwnerId: string, serverId: string) {
    const [server] = await this.txHost.tx
      .update(servers)
      .set({ ownerId: newOwnerId })
      .where(and(eq(servers.id, serverId), eq(servers.ownerId, userId)))
      .returning()
    return server
  }

  async findMemberInfoByServerId(serverId: string) {
    const members = await this.txHost.tx
      .select({
        userId: memberships.userId,
        userName: users.userName,
        userAvatar: users.avatar,
        role: memberships.role,
      })
      .from(memberships)
      .innerJoin(users, eq(memberships.userId, users.id))
      .where(eq(memberships.serverId, serverId))
    return members
  }

  async updateMembershipRole(userId: string, serverId: string, role: ServerRoleType) {
    const [membership] = await this.txHost.tx
      .update(memberships)
      .set({ role: role })
      .where(and(eq(memberships.userId, userId), eq(memberships.serverId, serverId)))
      .returning()
    return membership
  }

  async findServerSummariesByUserId(userId: string) {
    const myServers = await this.txHost.tx
      .select({
        serverId: memberships.serverId,
        serverName: servers.name,
        serverAvatar: servers.avatar,
      })
      .from(memberships)
      .where(eq(memberships.userId, userId))
      .innerJoin(servers, eq(memberships.serverId, servers.id))

    return myServers
  }

  async createServer(userId: string, body: CreateServerBodyType) {
    const [server] = await this.txHost.tx
      .insert(servers)
      .values({
        ...body,
        ownerId: userId,
      })
      .returning({
        id: servers.id,
        name: servers.name,
        avatar: servers.avatar,
        ownerId: servers.ownerId,
        createdAt: servers.createdAt,
      })
    return server
  }

  async createMembership(body: CreateMembership) {
    const [membership] = await this.txHost.tx
      .insert(memberships)
      .values({ ...body })
      .onConflictDoNothing()
      .returning()
    return membership
  }

  async createInvite(userId: string, serverId: string, body: CreateInviteBodyType) {
    const [invite] = await this.txHost.tx
      .insert(serverInvites)
      .values({ ...body, createdBy: userId, code: nanoid(10), serverId })
      .returning()

    return invite
  }

  async updateInviteCount(code: string) {
    const [invite] = await this.txHost.tx
      .update(serverInvites)
      .set({ useCount: sql`${serverInvites.useCount} + 1` })
      .where(
        and(
          eq(serverInvites.code, code),
          eq(serverInvites.isRevoked, false),
          or(isNull(serverInvites.maxUses), lt(serverInvites.useCount, serverInvites.maxUses)),
          or(isNull(serverInvites.expiresAt), gt(serverInvites.expiresAt, sql`now()`)),
        ),
      )
      .returning()
    return invite
  }

  async updateServer(serverId: string, body: UpdateServerBodyType) {
    const [server] = await this.txHost.tx
      .update(servers)
      .set({ ...body })
      .where(eq(servers.id, serverId))
      .returning()
    return server
  }

  async deleteServer(serverId: string) {
    await this.txHost.tx.delete(servers).where(eq(servers.id, serverId))
  }

  async findServerMetadataByServerId(serverId: string) {
    const [server] = await this.txHost.tx
      .select({
        id: servers.id,
        name: servers.name,
        avatar: servers.avatar,
        ownerId: servers.ownerId,
        ownerUserName: users.userName,
        ownerAvatar: users.avatar,
        memberCount: count(memberships.userId),
      })
      .from(servers)
      .innerJoin(users, eq(servers.ownerId, users.id))
      .leftJoin(memberships, eq(servers.id, memberships.serverId))
      .where(eq(servers.id, serverId))
      .groupBy(servers.id, users.id)
      .limit(1)

    return server
  }

  async findInvitesListJoinWithCreatorByServerId(serverId: string) {
    const invites = await this.txHost.tx
      .select({
        id: serverInvites.id,
        code: serverInvites.code,
        expiresAt: serverInvites.expiresAt,
        maxUses: serverInvites.maxUses,
        useCount: serverInvites.useCount,
        isRevoked: serverInvites.isRevoked,
        createdAt: serverInvites.createdAt,
        creatorAvatar: users.avatar,
        creatorUserName: users.userName,
      })
      .from(serverInvites)
      .leftJoin(users, eq(serverInvites.createdBy, users.id))
      .where(eq(serverInvites.serverId, serverId))
      .orderBy(desc(serverInvites.createdAt))
    return invites
  }

  async updateInviteIsRevoked(code: string) {
    const [invite] = await this.txHost.tx
      .update(serverInvites)
      .set({ isRevoked: true })
      .where(and(eq(serverInvites.code, code), eq(serverInvites.isRevoked, false)))
      .returning()
    return invite
  }

  async deleteMembershipByUserIdAndServerId(userId: string, serverId: string) {
    await this.txHost.tx
      .delete(memberships)
      .where(and(eq(memberships.serverId, serverId), eq(memberships.userId, userId)))
  }
}
