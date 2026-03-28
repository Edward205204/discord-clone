import { Injectable, NotFoundException } from '@nestjs/common'
import { UserRepository } from './user.repo'

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}
  async getMe(userId: string) {
    const user = await this.userRepo.findUserById(userId)
    if (!user) {
      throw new NotFoundException('User not found')
    }
    return user
  }
}
