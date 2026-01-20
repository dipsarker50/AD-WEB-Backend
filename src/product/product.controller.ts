import { Body, Controller, Delete, Get, Param, Patch, Post, UseInterceptors, UploadedFile, Res } from "@nestjs/common";
import { ProductService } from "./product.service";
import { CreateProductDto, UpdateProductDto } from "./product.dto";
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterError, diskStorage } from 'multer';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

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
      storage: diskStorage({
        destination: './uploads/products',
        filename: function (req, file, cb) {
          cb(null, Date.now() + '-' + file.originalname);
        },
      }),
    }),
  )
  addProduct(
    @Body() productData: CreateProductDto,
    @UploadedFile() file: Express.Multer.File
  ): object {
    return this.productService.addProduct(productData, file?.path);
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
