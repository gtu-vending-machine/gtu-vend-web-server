/* eslint-disable @typescript-eslint/indent */
import { Dispenser } from '@prisma/client';

// type CreateProductRequest = Pick<Product, 'name' | 'price' | 'image'>;
// type UpdateProductRequest = Partial<CreateProductRequest>;

// export { CreateProductRequest, UpdateProductRequest };

type CreateDispenserRequest = Pick<
  Dispenser,
  'index' | 'productId' | 'stock' | 'vendingMachineId'
>;

type UpdateDispenserRequest = Partial<CreateDispenserRequest>;

export { CreateDispenserRequest, UpdateDispenserRequest };
