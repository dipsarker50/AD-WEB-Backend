import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  const allowedOrigins = [
    'http://localhost:7001',
    'http://localhost:3001',
    'https://localhost:7001',
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL) {
        const frontendDomain = new URL(process.env.FRONTEND_URL).hostname;
        const requestDomain = new URL(origin).hostname;

        if (
          requestDomain === frontendDomain ||
          requestDomain.endsWith('.' + frontendDomain)
        ) {
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
      'X-Requested-With',
    ],
    optionsSuccessStatus: 200,
  });

  const port = Number(process.env.PORT) || 10000;
  await app.listen(port, '0.0.0.0');
  console.log(`Server is running on port ${port}`);
}
bootstrap();