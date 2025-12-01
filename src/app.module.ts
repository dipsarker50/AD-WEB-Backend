import { Module } from '@nestjs/common';
import { AgentModule } from './agent/agent.module';
import { ProductModule } from './product/product.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from "@nestjs-modules/mailer";

@Module({
  imports: [AgentModule,ProductModule, TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'aws-1-ap-south-1.pooler.supabase.com',    
      port: 5432,
      username: 'postgres.jltfbcyrosgondzdttsk',          
      password: 'admin123@',  
      database: 'postgres',          
      autoLoadEntities: true,
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,   // required for Supabase
      },
    }),
    MailerModule.forRoot({
      transport: {
      host: 'smtp.gmail.com',
      port: 465,
      ignoreTLS: true,
      secure: true,
      auth: {
      user: 'jonerics206@gmail.com',
      pass: 'oahk xtea kyqm afva'
      },
      }})
  
  
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
