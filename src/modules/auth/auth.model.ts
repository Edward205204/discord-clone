import z from 'zod'

const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(32, 'Password must be at most 32 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
  )

export const RegisterBody = z
  .object({
    email: z.email('Invalid email address'),
    password: PasswordSchema,
    userName: z.string().min(3, 'Username must be at least 3 characters'),
    otp: z.string().length(6, 'OTP must be 6 characters'),
    confirmPassword: PasswordSchema,
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password and confirm password do not match',
        path: ['password', 'confirmPassword'],
      })
    }
  })

export const LoginBody = z.object({
  email: z.email('Invalid email address'),
  password: PasswordSchema,
})

export const SendRegistrationVerificationBody = z
  .object({
    email: z.email('Invalid email address'),
  })
  .strict()

export const SendResetPasswordVerificationBody = SendRegistrationVerificationBody

export const ResetPasswordBody = z
  .object({
    email: z.email('Invalid email address'),
    otp: z.string().length(6, 'OTP must be 6 characters'),
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password and confirm password do not match',
        path: ['password', 'confirmPassword'],
      })
    }
  })

export const LogoutBody = z
  .object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  })
  .strict()

export const RefreshTokenBody = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBody>
export type RegisterBodyType = z.infer<typeof RegisterBody>
export type LoginBodyType = z.infer<typeof LoginBody>
export type SendRegistrationVerificationBodyType = z.infer<typeof SendRegistrationVerificationBody>
export type SendResetPasswordVerificationBodyType = z.infer<typeof SendResetPasswordVerificationBody>
export type ResetPasswordBodyType = z.infer<typeof ResetPasswordBody>
export type LogoutBodyType = z.infer<typeof LogoutBody>
