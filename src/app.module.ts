import { Module } from '@nestjs/common'
import { AuthModule } from './modules/auth/auth.module'
import { DatabaseModule } from './shared/infrastructure/database/database.module'
import { AccessTokenGuard } from './shared/common/guards/access-token.guard'
import { APIKeyGuard } from './shared/common/guards/api-key.guard'
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { AuthenticationGuard } from './shared/common/guards/authentication.guard'
import CustomZodValidationPipe from './shared/common/pipes/z-validation.pipe'
import { ZodSerializerInterceptor } from 'nestjs-zod'
import { SecurityModule } from './shared/infrastructure/security/security.module'
import { UserModule } from './modules/user/user.module';

const SharedModules = [DatabaseModule, SecurityModule]
@Module({
  imports: [AuthModule, ...SharedModules, UserModule],
  providers: [
    AccessTokenGuard,
    APIKeyGuard,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },

    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
  ],
})
export class AppModule {}
