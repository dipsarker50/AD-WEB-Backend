import { Injectable } from "@nestjs/common";
import { ProductEntity } from "./product.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateProductDto, UpdateProductDto } from "./product.dto";

@Injectable()
export class ProductService {
  constructor(@InjectRepository(ProductEntity) private productRepository: Repository<ProductEntity>) {}

  getAllProducts(): Object {
    return this.productRepository.find({
      relations: ['agent']
    });
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
    return product;
  }

  async getProductImage(id: string, res): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id: parseInt(id) },
    });
    if (!product || !product.imageUrl) {
      return res.status(404).json({ message: 'Image not found' });
    }
    return res.sendFile(product.imageUrl, { root: './' });
  }
    async getProductImagebyName(name: string, res): Promise<void> { 
        if(!name){
            return res.status(404).json({ message: 'Image not found' });
        }
        return res.sendFile(name, { root: './' });
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
