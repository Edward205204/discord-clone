export const VerificationCode = {
  REGISTRATION: 'registration',
  RESET_PASSWORD: 'reset_password',
} as const

export const VERIFICATION_CODE_VALUES = Object.values(VerificationCode) as [
  VerificationCodeType,
  ...VerificationCodeType[],
]
export type VerificationCodeType = (typeof VerificationCode)[keyof typeof VerificationCode]
