import { IsString, IsNumber, IsOptional, Min, IsInt } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0, { message: 'Price must be a positive number' })
  price: number;

  @IsInt()
  @Min(0, { message: 'Stock must be a positive integer' })
  stock: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsInt()
  agentId: number;  // Foreign key to link with Agent
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
