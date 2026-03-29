import { DocumentBuilder } from '@nestjs/swagger'

export const SwaggerConfig = new DocumentBuilder()
  .setTitle('Chat System')
  .setDescription('Chat System API description')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
    'access-token',
  )
  .build()
