import {
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common'

export type AuthValidationIssue = { path: string; message: string }

/** 422 — email đã tồn tại (đăng ký). */
export class AuthEmailAlreadyExistsUnprocessableException extends UnprocessableEntityException {
  constructor() {
    super([{ path: 'email', message: 'Email already exists' } satisfies AuthValidationIssue])
  }
}

/** 422 — OTP không hợp lệ hoặc hết hạn. */
export class AuthInvalidOrExpiredOtpException extends UnprocessableEntityException {
  constructor(path: 'otp' | 'email' = 'otp') {
    super([{ path, message: 'Invalid or expired OTP' } satisfies AuthValidationIssue])
  }
}

/** 422 — sai email hoặc mật khẩu (đăng nhập). */
export class AuthInvalidLoginCredentialsException extends UnprocessableEntityException {
  constructor() {
    super([
      { path: 'email', message: 'Invalid email or password' },
      { path: 'password', message: 'Invalid email or password' },
    ] satisfies AuthValidationIssue[])
  }
}

/** 500 — không decode được exp của refresh token sau khi ký. */
export class AuthCannotInitializeRefreshTokenException extends InternalServerErrorException {
  constructor(message = 'Cannot initialize refresh token') {
    super(message)
  }
}

/** 409 — email đã đăng ký (gửi OTP đăng ký). */
export class AuthEmailAlreadyRegisteredConflictException extends ConflictException {
  constructor(message = 'Email already exists') {
    super(message)
  }
}

/** 429 — gửi OTP quá nhanh (cooldown). */
export class AuthOtpRateLimitedException extends HttpException {
  constructor(retryAfterSec: number) {
    super(
      {
        message: 'Please wait before requesting another verification code',
        retryAfterSec,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    )
  }
}

/** 409 — không tìm thấy email (gửi OTP reset — theo policy hiện tại của service). */
export class AuthEmailNotFoundConflictException extends ConflictException {
  constructor(message = 'Email not found') {
    super(message)
  }
}

export class AuthInvalidRefreshTokenException extends ForbiddenException {
  constructor(message = 'Invalid refresh token') {
    super(message)
  }
}
