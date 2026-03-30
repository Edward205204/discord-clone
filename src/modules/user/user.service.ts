import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { UserRepository } from './user.repo'
import { UpdateUserBodyType } from './user.model'
import { filterDto } from 'src/shared/util/filter-dto'

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

  async updateMe(userId: string, body: UpdateUserBodyType) {
    const updateDate = filterDto(body)
    if (!Object.keys(updateDate).length) {
      throw new BadRequestException('No fields to update')
    }
    const user = await this.userRepo.updateUserById(userId, updateDate)
    return user
  }

  findUserIdByEmail(email: string) {
    return this.userRepo.findUserIdByEmail(email)
  }

  findUserByEmailWithCredentials(email: string) {
    return this.userRepo.findUserByEmailWithCredentials(email)
  }

  createUser(payload: { email: string; userName: string; password: string; avatar?: string }) {
    return this.userRepo.createUser(payload)
  }

  updatePasswordByUserId(userId: string, hashedPassword) {
    return this.userRepo.updatePasswordByUserId(userId, hashedPassword)
  }
}
