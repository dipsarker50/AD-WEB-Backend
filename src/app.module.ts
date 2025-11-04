import { Module } from '@nestjs/common';
import { FarmerModule } from './farmer/farmer.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [FarmerModule,ProductModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
