import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as mongoose from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    preflightContinue: false,
  });

  const config = new DocumentBuilder()
    .setTitle('Agent X API')
    .setDescription('The Agent X API description')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  mongoose.connect('mongodb://localhost:27017/agent_x_new', {
    serverSelectionTimeoutMS: 60000, // Set server selection timeout to 60 seconds
    socketTimeoutMS: 60000, // Set socket timeout to 60 seconds
  });

  await app.listen(8070);
  console.log(`Application is running on: http://localhost:8070`);
}
bootstrap();
