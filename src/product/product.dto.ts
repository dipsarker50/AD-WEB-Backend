import { IsString, IsNumber, IsOptional, Min, IsInt, IsBoolean, IsArray, Max, IsDate } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

   @Type(() => Number) 
  @IsNumber()
  @Min(0, { message: 'Price must be a positive number' })
  price: number;

  @IsString()
  @IsOptional()
  unit?: string;  // e.g., 'kg', 'piece', 'dozen', 'liter'

  @Type(() => Number) 
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

  // Rating & Reviews
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  rating?: number;  // 0.0 to 5.0

  @IsInt()
  @Min(0)
  @IsOptional()
  reviewCount?: number;

  // Marketing
   @Type(() => Number) 
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discount?: number;  // Percentage discount

  // Agricultural specific
  @IsBoolean()
  @IsOptional()
  isOrganic?: boolean;

  @IsString()
  @IsOptional()
  location?: string;  // Farm/seller location

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  harvestDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expiryDate?: Date;

  // Additional details
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];  // e.g., ['fresh', 'local', 'seasonal']

  @IsNumber()
  @Min(1)
  @IsOptional()
  minOrderQuantity?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  maxOrderQuantity?: number;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
