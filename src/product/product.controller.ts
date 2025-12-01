import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ProductService } from "./product.service";
import { CreateProductDto, UpdateProductDto } from "./product.dto";

@Controller('product')
export class ProductController {
        constructor(private readonly productService: ProductService) {}

          @Get('allproducts')
          async getAllProducts(): Promise<Object> {
            return await this.productService.getAllProducts();
          }

          @Post('addProduct')
          addProduct(@Body() productData: CreateProductDto): object {
            return this.productService.addProduct(productData);
          }

          @Patch('updateProduct/:id')
          updateProduct(@Param('id') id: string, @Body() productData: UpdateProductDto): object{
            return this.productService.updateProduct(id, productData);
          }

          @Delete('deleteProduct/:id')
          deleteProduct(@Param('id') id: string): object {
            return this.productService.deleteProduct(id);
          } 
}