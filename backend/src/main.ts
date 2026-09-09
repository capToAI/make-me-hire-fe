import * as dotenv from 'dotenv';
dotenv.config();

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));
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
  await app.listen(port, '0.0.0.0');
  console.log(`NestJS backend application running at: http://localhost:${port}`);
  console.log(`Swagger OpenAPI documentation at: http://localhost:${port}/api/docs`);
}

bootstrap();
