import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { SwaggerModule } from '@nestjs/swagger'
import { SwaggerConfig } from './shared/constant/swagger'
import { env } from './shared/infrastructure/config/env.config'
async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const documentFactory = () => SwaggerModule.createDocument(app, SwaggerConfig)
  SwaggerModule.setup('api', app, documentFactory)

  await app.listen(env.APP_PORT ?? 3000)
}
bootstrap()
