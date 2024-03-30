import { VendingMachine } from '@prisma/client';

type CreateVendingMachineRequest = Pick<VendingMachine, 'name'>;
type UpdateVendingMachineRequest = Partial<CreateVendingMachineRequest>;

export { CreateVendingMachineRequest, UpdateVendingMachineRequest };
