import { Injectable } from "@nestjs/common";
import { ProductEntity } from "./product.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateProductDto, UpdateProductDto } from "./product.dto";
import { SupabaseService } from "src/storage/supabase.service";

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity) private productRepository: Repository<ProductEntity>,
    private readonly supabaseService: SupabaseService,
  ) {}

  async getAllProducts(): Promise<Object> {
    const products = await this.productRepository.find({
      relations: ['agent']
    });

    return products.map((product) => ({
      ...product,
      imageUrl: this.normalizeImageUrl(product.imageUrl),
    }));
  }

  addProduct(productData: CreateProductDto, filePath?: string): Promise<Object> {
    const newProduct = this.productRepository.create({
      ...productData,
      imageUrl: filePath || productData.imageUrl
    });
    return this.productRepository.save(newProduct);
  }

  async getProductById(id: string): Promise<object> {
    const product = await this.productRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['agent'],
    });
    if (!product) {
      return { message: 'Product not found' };
    }
    return {
      ...product,
      imageUrl: this.normalizeImageUrl(product.imageUrl),
    };
  }

  async getProductImage(id: string, res): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id: parseInt(id) },
    });
    if (!product || !product.imageUrl) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    // Since we're using Supabase URLs, return the URL in JSON format
    // Frontend can use this URL directly to display images
    return res.json({
      success: true,
      imageUrl: this.normalizeImageUrl(product.imageUrl),
      message: 'Product image URL retrieved successfully'
    });
  }
    async getProductImagebyName(name: string, res): Promise<void> { 
        if(!name){
            return res.status(404).json({ message: 'Image not found' });
        }
        // For Supabase URLs, we can return the URL directly
        return res.json({
          success: true,
          imageUrl: this.normalizeImageUrl(name),
          message: 'Product image URL retrieved successfully'
        });
    }

  private normalizeImageUrl(imageUrl?: string): string | undefined {
    if (!imageUrl) return imageUrl;
    return this.supabaseService.toDisplayUrl(imageUrl);
  }

  async updateProduct(id: string, productData: UpdateProductDto): Promise<object> {
    let data=await this.productRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['agent'],
      select:
      {
        agent: { id:true}
      }
    });
    if (!(data)) {
      return { message: 'Product not found' };
    }
    console.log('Existing product data:', productData);
    const product ={...data,...productData}
    console.log('Merged product data:', product);
    await this.productRepository.update(id, product);
    return { message: 'Product updated successfully!', values: productData };
  }

  async deleteProduct(id: string): Promise<object> {
    let result = await this.productRepository.delete(id);
    if (result.affected == 0) {
      return { message: 'Product not found' };
    }
    return { message: 'Product deleted successfully' };
  }
}
