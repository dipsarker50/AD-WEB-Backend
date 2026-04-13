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
    'https://localhost:7001', // HTTPS local
    process.env.FRONTEND_URL, // Production frontend URL
  ].filter(Boolean); // Remove any undefined values

  // Enable trust proxy for Render deployment
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // For production, be more flexible with subdomain matching
      if (process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL) {
        const frontendDomain = new URL(process.env.FRONTEND_URL).hostname;
        const requestDomain = new URL(origin).hostname;
        if (requestDomain === frontendDomain || requestDomain.endsWith('.' + frontendDomain)) {
          return callback(null, true);
        }
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cookie',
      'Set-Cookie',
      'Access-Control-Allow-Credentials',
      'Access-Control-Allow-Origin',
      'X-Requested-With'
    ],
    optionsSuccessStatus: 200, // Support legacy browsers
  });
  
  await app.listen(process.env.PORT ?? 10000);
}
bootstrap();
