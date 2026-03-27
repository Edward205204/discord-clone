import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { REQUEST_USER_KEY } from 'src/shared/constant/auth.constant'
import TokenPayload from 'src/shared/types/token.payload'

export const ActiveUser = createParamDecorator((field: keyof TokenPayload | undefined, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest()
  const user: TokenPayload | undefined = request[REQUEST_USER_KEY]
  return field ? user?.[field] : user
})
