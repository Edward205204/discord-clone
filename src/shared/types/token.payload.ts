import { RoleType } from '../constant/system-role'

export default interface TokenPayload {
  id: string
  userId: string
  role: RoleType
  iat: number
  exp: number
}
