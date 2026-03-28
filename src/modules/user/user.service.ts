import { Injectable } from '@nestjs/common'
import TokenPayload from 'src/shared/types/token.payload'
import { UserRepository } from './user.repo'

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}
  // async getMe(user: TokenPayload) {
  //   const user = await this.userRepo.findUserById(user.id)
  // }
}
