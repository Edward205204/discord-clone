import z from 'zod'

// response cho thông tin cơ bản cho user
export const UserResponse = z.object({
  id: z.string('ID is required'),
  email: z.string('Email is required'),
  userName: z.string('Username is required'),
  avatar: z.string('Avatar is required'),
  role: z.string('Role is required'),
})

// response cho login và register
export const AuthResponse = z.object({
  accessToken: z.string('Access token is required'),
  refreshToken: z.string('Refresh token is required'),
  user: UserResponse,
})

export const MessageResponse = z.object({
  message: z.string('Message is required'),
})

export const RefreshTokenResponse = z.object({
  accessToken: z.string('Access token is required'),
  refreshToken: z.string('Refresh token is required'),
})
