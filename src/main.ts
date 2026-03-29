import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { SwaggerModule } from '@nestjs/swagger'
import { SwaggerConfig } from './shared/constant/swagger'
async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const documentFactory = () => SwaggerModule.createDocument(app, SwaggerConfig)
  SwaggerModule.setup('api', app, documentFactory)

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
