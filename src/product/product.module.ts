import { Module } from '@nestjs/common';
import {ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductEntity } from './product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupabaseService } from 'src/storage/supabase.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity])],
  controllers: [ProductController],
  providers: [ProductService, SupabaseService],
})
export class ProductModule {}
