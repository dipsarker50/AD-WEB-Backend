import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentEntity } from './agent.entity';
import { ProductEntity } from 'src/product/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AgentEntity]),TypeOrmModule.forFeature([ProductEntity])],
  controllers: [AgentController],
  providers: [AgentService],
})
export class AgentModule {}
