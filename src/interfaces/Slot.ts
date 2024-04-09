/* eslint-disable @typescript-eslint/indent */
import { Slot } from '@prisma/client';

// type CreateProductRequest = Pick<Product, 'name' | 'price' | 'image'>;
// type UpdateProductRequest = Partial<CreateProductRequest>;

// export { CreateProductRequest, UpdateProductRequest };

type CreateSlotRequest = Pick<
  Slot,
  'index' | 'productId' | 'stock' | 'vendingMachineId'
>;

type UpdateSlotRequest = Partial<CreateSlotRequest>;

export { CreateSlotRequest, UpdateSlotRequest };
