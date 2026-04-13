import { Body, Controller, Delete, Get, Param, Patch, Post, UseInterceptors, UploadedFile, Res } from "@nestjs/common";
import { ProductService } from "./product.service";
import { CreateProductDto, UpdateProductDto } from "./product.dto";
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterError } from 'multer';
import { SupabaseService } from 'src/storage/supabase.service';

@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly supabaseService: SupabaseService
  ) {}

  @Get('allproducts')
  async getAllProducts(): Promise<Object> {
    return await this.productService.getAllProducts();
  }

  @Get('productbyid/:id')
  getProductById(@Param('id') id: string): object {
    return this.productService.getProductById(id);
  }

  @Post('addProduct')
  @UseInterceptors(
    FileInterceptor('productImage', {
      fileFilter: (req, file, cb) => {
        if (file.originalname.match(/^.*\.(jpg|webp|png|jpeg)$/))
          cb(null, true);
        else {
          cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'image'), false);
        }
      },
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  async addProduct(
    @Body() productData: CreateProductDto,
    @UploadedFile() file: Express.Multer.File
  ): Promise<object> {
    try {
      let imageUrl: string | undefined;
      
      if (file) {
        // Upload to Supabase
        imageUrl = await this.supabaseService.uploadFile(file, `products/${Date.now()}-${file.originalname}`);
      }
      
      return this.productService.addProduct(productData, imageUrl);
    } catch (error) {
      console.error('Product upload error:', error);
      return {
        success: false,
        message: 'Failed to upload product',
        error: (error as Error)?.message || 'Unknown upload error',
      };
    }
  }

  @Get('getproductimage/:id')
  getProductImage(@Param('id') id: string, @Res() res) {
    return this.productService.getProductImage(id, res);
  }

   @Get('getproductimageby/:name')
  getProductImagebyName(@Param('name') name: string, @Res() res) {
    return this.productService.getProductImagebyName(name, res);
  }

  @Patch('updateProduct/:id')
  updateProduct(@Param('id') id: string, @Body() productData: UpdateProductDto): object {
    return this.productService.updateProduct(id, productData);
  }

  @Delete('deleteProduct/:id')
  deleteProduct(@Param('id') id: string): object {
    return this.productService.deleteProduct(id);
  }
}
