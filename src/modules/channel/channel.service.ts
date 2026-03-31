import { Injectable } from '@nestjs/common'
import { ChannelRepository } from './channel.repo'

@Injectable()
export class ChannelService {
  constructor(private readonly channelRepository: ChannelRepository) {}

  // Public API

  // 1. Tạo channel, chỉ có owner hoặc mode mới có quyền, tạm mod chưa được thêm, sau này làm kĩ rbac sau.
  // Method này ko public route, chỉ tạo channel cho server, server modules tự check quyền rồi gọi lại method này.

  // 2. xóa channel, owner được xóa, mod sau này rbac sau

  // 3. thêm member vào channel private(table channelMembers)

  // 4. xóa member khỏi channel private(table channelMembers)

  // 6. lấy danh sách channel phù hợp dựa vào userId

  // 7. lấy danh sách member của channel private(table channelMembers)

  // 8. Update channel (đổi tên, đổi public/private)

  // internal - dùng bởi server service
  deleteChannelMembersByUserId(userId: string) {
    return this.channelRepository.deleteChannelMembersByUserId(userId)
  }
}
