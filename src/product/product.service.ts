import { Injectable } from "@nestjs/common";
import { ProductEntity } from "./product.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateProductDto, UpdateProductDto } from "./product.dto";

@Injectable()
export class ProductService {
       constructor( @InjectRepository(ProductEntity) private productRepository: Repository<ProductEntity>){}
        getAllProducts(): Object {
                return this.productRepository.find({
                        relations: ['agent'],
                        select: {
                                id: true,
                                name: true,
                        agent: {
                                id: true,
                                fullName: true,
                                email: true,
                        },
                        },
                });
        }


        addProduct(productData: CreateProductDto): Promise<Object> {
                const newProduct = this.productRepository.create(productData);
                return this.productRepository.save(newProduct);
        }

        async updateProduct(id: string, productData: UpdateProductDto): Promise<object> {
                if(!(await this.productRepository.findOneBy({id: parseInt(id)}))){
                        return {message:'Product not found'};
                }
                const product = await this.productRepository.update(parseInt(id), productData);
                return { message: 'Product updated successfully!', values: productData };
                
        }

        async deleteProduct(id: string): Promise<object> {
                let result=await this.productRepository.delete(id);
                if(result.affected==0){
                        return {message:'Product not found'};
                }
                return {message:'Product deleted successfully'};
        };

}