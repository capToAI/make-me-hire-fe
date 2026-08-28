import * as dotenv from 'dotenv';
dotenv.config();

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Configure Swagger OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('Make My Resume API')
    .setDescription('Backend REST API and LangChain Resume Extraction Agent')
    .setVersion('1.0')
    .addTag('Resume Builder', 'Endpoints for extracting and building resumes')
    .addTag('App', 'System health and status endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`NestJS backend application running at: http://localhost:${port}`);
  console.log(`Swagger OpenAPI documentation at: http://localhost:${port}/api/docs`);
}

bootstrap();
