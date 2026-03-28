export const Role = {
  ADMIN: 'admin',
  USER: 'user',
} as const

export const ROLE_VALUES = Object.values(Role) as [RoleType, ...RoleType[]]
export type RoleType = (typeof Role)[keyof typeof Role]
