import { Controller, Get } from '@nestjs/common'
import { UserService } from './user.service'
import { ActiveUser } from 'src/shared/common/decorators/active-user.decorator'
import type TokenPayload from 'src/shared/types/token.payload'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getMe(@ActiveUser() user: TokenPayload) {
    // return this.userService.getMe(user)
  }
}
