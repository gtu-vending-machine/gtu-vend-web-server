import { Product } from '@prisma/client';

type CreateProductRequest = Pick<Product, 'name' | 'price' | 'image'>;
type UpdateProductRequest = Partial<CreateProductRequest>;

export { CreateProductRequest, UpdateProductRequest };
