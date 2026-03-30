import { ClsModule } from 'nestjs-cls'
import { Module } from '@nestjs/common'
import { AuthModule } from './modules/auth/auth.module'
import { DatabaseModule } from './shared/infrastructure/database/database.module'
import { AccessTokenGuard } from './shared/common/guards/access-token.guard'
import { APIKeyGuard } from './shared/common/guards/api-key.guard'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { AuthenticationGuard } from './shared/common/guards/authentication.guard'
import CustomZodValidationPipe from './shared/common/pipes/z-validation.pipe'
import { ZodSerializerInterceptor } from 'nestjs-zod'
import { SecurityModule } from './shared/infrastructure/security/security.module'
import { UserModule } from './modules/user/user.module'
import { TransactionalAdapterDrizzleOrm } from '@nestjs-cls/transactional-adapter-drizzle-orm'
import { DRIZZLE_DB } from './shared/infrastructure/database/database.constants'
import { ClsPluginTransactional } from '@nestjs-cls/transactional'
import { ServerModule } from './modules/server/server.module'
import { HttpExceptionFilter } from './shared/common/filters/http-exc.filter'

const SharedModules = [DatabaseModule, SecurityModule, ServerModule]
@Module({
  imports: [
    AuthModule,
    ...SharedModules,
    UserModule,
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
      },
      plugins: [
        new ClsPluginTransactional({
          adapter: new TransactionalAdapterDrizzleOrm({
            drizzleInstanceToken: DRIZZLE_DB,
          }),
        }),
      ],
    }),
  ],
  providers: [
    AccessTokenGuard,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
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
