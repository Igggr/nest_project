import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { BearerAuth } from './docs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // настройки swagger доккументации
  const config = new DocumentBuilder()
    .setTitle('Просто учебный проект')
    .setDescription('Rest API к проекту')
    .setVersion('1.0.0')
    .addTag('v0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'jwt' },
      BearerAuth
    )
    .build();

  const documnet = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/', app, documnet);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.APP_PORT);
}
bootstrap();
