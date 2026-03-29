import z from 'zod'

// @shared UserResponse
export const UserResponse = z.object({
  id: z.string('ID is required'),
  email: z.string('Email is required'),
  userName: z.string('Username is required'),
  avatar: z.string('Avatar is required'),
  role: z.string('Role is required'),
})
