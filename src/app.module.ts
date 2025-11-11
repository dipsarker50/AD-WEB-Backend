import { Module } from '@nestjs/common';
import { AgentModule } from './agent/agent.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [AgentModule,ProductModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
