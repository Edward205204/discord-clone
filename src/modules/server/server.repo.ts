import { TransactionHost } from '@nestjs-cls/transactional'
import { Injectable } from '@nestjs/common'
import { MyDrizzleAdapter } from 'src/shared/infrastructure/database/database.types'
import { CreateInviteBodyType, CreateMembership, CreateServerBodyType } from './server.model'
import { memberships, serverInvites, servers } from './server.schema'
import { nanoid } from 'nanoid'
import { and, desc, eq, gt, isNull, lt, or, sql } from 'drizzle-orm'
import { users } from '../user/user.schema'

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
