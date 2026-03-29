import z from 'zod'

export const UpdateUserBody = z
  .object({
    userName: z.string().min(3, 'Username must be at least 3 characters').optional(),
    avatar: z.url('Invalid avatar URL').optional(),
  })
  .strict()

export type UpdateUserBodyType = z.infer<typeof UpdateUserBody>
