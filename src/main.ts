import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  // Configure CORS for both development and production
  const allowedOrigins = [
    'http://localhost:7001',  // Local frontend
    'http://localhost:3001',  // Alternative local port
    process.env.FRONTEND_URL, // Production frontend URL
  ].filter(Boolean); // Remove any undefined values

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cookie',
      'Set-Cookie',
      'Access-Control-Allow-Credentials',
      'Access-Control-Allow-Origin'
    ],
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
