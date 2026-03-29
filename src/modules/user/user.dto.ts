import { createZodDto } from 'nestjs-zod'
import { UpdateUserBody } from './user.model'

export class UpdateUserDto extends createZodDto(UpdateUserBody) {}
