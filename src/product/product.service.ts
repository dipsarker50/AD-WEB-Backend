import { Injectable } from "@nestjs/common";

@Injectable()
export class ProductService {
        getAllProducts(): Object {
                return { message: "List of all products" };
        }
}