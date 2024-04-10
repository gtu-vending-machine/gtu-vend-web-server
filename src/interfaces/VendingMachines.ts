/* eslint-disable @typescript-eslint/indent */
import { VendingMachine, Slot, Product } from '@prisma/client';

type CreateVendingMachineRequest = Pick<VendingMachine, 'name'> & {
  slotCount?: number;
};
type UpdateVendingMachineRequest = Partial<CreateVendingMachineRequest>;

type VendingMachineResponse = Pick<VendingMachine, 'id' | 'name'> & {
  slots: Partial<Slot> &
    {
      product: Pick<Product, 'id' | 'name' | 'price' | 'image'> | null;
    }[];
};

type VendingMachineUndetailedResponse = Pick<VendingMachine, 'id' | 'name'> & {
  _slotCount: number;
};

export {
  CreateVendingMachineRequest,
  UpdateVendingMachineRequest,
  VendingMachineUndetailedResponse,
  VendingMachineResponse,
};
