export const Roles = ['admin', 'user'] as const
export type RoleType = (typeof Roles)[keyof typeof Roles]
