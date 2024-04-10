/* eslint-disable @typescript-eslint/indent */
import { Slot } from '@prisma/client';
import { Request } from 'express';

// type CreateProductRequest = Pick<Product, 'name' | 'price' | 'image'>;
// type UpdateProductRequest = Partial<CreateProductRequest>;

// export { CreateProductRequest, UpdateProductRequest };

type CreateSlotRequest = Pick<
  Slot,
  'index' | 'productId' | 'stock' | 'vendingMachineId'
>;

// type AddProductToSlotRequest = Pick<Slot, 'productId' | 'stock'>
interface AddProductToSlotRequest extends Request {
  body: {
    productId: number;
    stock: number;
  };
}

type UpdateSlotRequest = Partial<CreateSlotRequest>;

export { CreateSlotRequest, UpdateSlotRequest, AddProductToSlotRequest };
