import { TransactionHost } from '@nestjs-cls/transactional'
import { Injectable } from '@nestjs/common'
import { MyDrizzleAdapter } from 'src/shared/infrastructure/database/database.types'
import { channelMembers } from './channel.schema'
import { eq } from 'drizzle-orm'

@Injectable()
export class ChannelRepository {
  constructor(private readonly txHost: TransactionHost<MyDrizzleAdapter>) {}

  async deleteChannelMembersByUserId(userId: string) {
    await this.txHost.tx.delete(channelMembers).where(eq(channelMembers.userId, userId))
  }
}
