import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentEntity } from './agent.entity';
import { ProductEntity } from 'src/product/product.entity';
import { AgentImageEntity } from './agentImage.entity';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from 'src/auth/Mailer/mailer.module';

@Module({
  imports: [TypeOrmModule.forFeature([AgentEntity]),TypeOrmModule.forFeature([ProductEntity]),TypeOrmModule.forFeature([AgentImageEntity]),JwtModule.register({
      secret: 'dipsarker_secret_key', 
      signOptions: { expiresIn: '120m' },
    }),MailerModule],
  controllers: [AgentController],
  providers: [AgentService],
})
export class AgentModule {}
