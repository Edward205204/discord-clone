export const ServerRole = {
  Owner: 'owner',
  Member: 'member',
  Moderator: 'moderator',
} as const

export const SERVER_ROLE_VALUES = Object.values(ServerRole) as [ServerRoleType, ...ServerRoleType[]]
export type ServerRoleType = (typeof ServerRole)[keyof typeof ServerRole]
