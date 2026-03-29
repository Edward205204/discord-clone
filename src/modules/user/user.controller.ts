import { Body, Controller, Get, Patch } from '@nestjs/common'
import { UserService } from './user.service'
import { ActiveUser } from 'src/shared/common/decorators/active-user.decorator'
import type TokenPayload from 'src/shared/types/token.payload'
import { ZodSerializerDto } from 'nestjs-zod'
import { UserResponse } from './user.serialize'
import { UpdateUserDto } from './user.dto'
import { ApiBearerAuth } from '@nestjs/swagger'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ZodSerializerDto(UserResponse)
  @ApiBearerAuth('access-token')
  getMe(@ActiveUser() user: TokenPayload) {
    return this.userService.getMe(user.userId)
  }

  @Patch('me')
  @ApiBearerAuth('access-token')
  @ZodSerializerDto(UserResponse)
  updateMe(@ActiveUser() user: TokenPayload, @Body() body: UpdateUserDto) {
    return this.userService.updateMe(user.userId, body)
  }
}
