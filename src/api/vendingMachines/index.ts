/* eslint-disable @typescript-eslint/indent */
import express from 'express';
import { prisma } from '../../prismaClient';
import ErrorResponse from '../../interfaces/ErrorResponse';
import { VendingMachine, Slot } from '@prisma/client';

import {
  CreateVendingMachineRequest,
  UpdateVendingMachineRequest,
  VendingMachineResponse,
  VendingMachineUndetailedResponse,
} from '../../interfaces/VendingMachines';

import {
  failedToCreate,
  failedToDelete,
  failedToFetch,
  failedToUpdate,
  missingFields,
} from '../../utils/errorMessages';
import verifyRole from '../../middlewares/verifyRole';
import { QueryRequest } from '../../interfaces/Filter';
import { getWhereClause } from '../../utils/getWhereClause';

const vendingMachinesRouter = express.Router();

vendingMachinesRouter.get<
  {},
  VendingMachineUndetailedResponse[] | [] | ErrorResponse
>('/', async (req, res, next) => {
  try {
    const vendingMachines = await prisma.vendingMachine.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            slots: true,
          },
        },
      },
    });
    return res.json(
      vendingMachines.map((vendingMachine) => ({
        ...vendingMachine,
        _slotCount: vendingMachine._count.slots,
        _count: undefined,
      })),
    );
  } catch (error) {
    console.error(error);
    next(error);
    return failedToFetch('vending machines', error);
  }
});

vendingMachinesRouter.get<
  { id: string },
  VendingMachineResponse | null | ErrorResponse
>('/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json(missingFields(['id']));
  }

  try {
    const vendingMachine = await prisma.vendingMachine.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slots: {
          select: {
            id: true,
            index: true,
            stock: true,
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
              },
            },
          },
          orderBy: {
            index: 'asc',
          },
        },
      },
    });

    return res.json(vendingMachine);
  } catch (error) {
    console.error(error);
    next(error);
    return failedToFetch('vending machine', error);
  }
});

// with query
interface VendingMachinesWithCount {
  vendingMachines: VendingMachineUndetailedResponse[];
  _count: number;
}

vendingMachinesRouter.post<{}, VendingMachinesWithCount | [] | ErrorResponse>(
  '/query',
  async (req: QueryRequest<VendingMachine>, res, next) => {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json(missingFields(['query']));
    }

    const { filter, pagination, sort } = query;
    const fields: (keyof VendingMachine)[] = ['id', 'name'];

    const whereClause = getWhereClause<VendingMachine>(filter, fields);

    // pagination logic
    const { page = 1, pageSize = 5 } = pagination || {};
    const skip = (page - 1) * pageSize;

    // get vending machines and count
    await prisma.vendingMachine
      .findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              slots: true,
            },
          },
        },

        orderBy: sort
          ? {
              [sort.field]: sort.order,
            }
          : undefined,
        skip,
        take: pageSize,
      })
      .then((vendingMachines) => {
        prisma.vendingMachine
          .count({
            where: whereClause,
          })
          .then((count) => {
            res.json({
              vendingMachines: vendingMachines.map((vendingMachine) => ({
                ...vendingMachine,
                _slotCount: vendingMachine._count.slots,
                _count: undefined,
              })),
              _count: count,
            });
          });
      })
      .catch((error) => {
        console.error(error);
        next(error);
        return failedToFetch('vending machines', error);
      });
  },
);

// if slotNumber is provided, create slots
// and connect them to the vending machine, otherwise
// create only the vending machine
vendingMachinesRouter.post<{}, VendingMachine | ErrorResponse | null>(
  '/',
  verifyRole(['admin']),
  async (req, res, next) => {
    const { name, slotCount } = req.body as CreateVendingMachineRequest;

    if (name === undefined) {
      return res.status(400).json(missingFields(['name']));
    }

    try {
      // create vending machine
      const vendingMachine = await prisma.vendingMachine.create({
        data: {
          name,
        },
        select: {
          id: true,
          name: true,
          slots: {
            select: {
              id: true,
              index: true,
            },
          },
        },
      });

      // create slots and connect them to vending machine
      if (slotCount) {
        const slots: Slot[] = [];
        for (let i = 0; i < slotCount; i++) {
          const slot = await prisma.slot.create({
            data: {
              index: i,
              vendingMachineId: vendingMachine.id,
            },
          });
          slots.push(slot);
          vendingMachine.slots.push(slot);
        }
      }

      return res.json(vendingMachine);
    } catch (error) {
      console.error(error);
      next(error);
      return failedToCreate('vending machine', error);
    }
  },
);

vendingMachinesRouter.put<{ id: string }, VendingMachine | ErrorResponse>(
  '/:id',
  verifyRole(['admin']),
  async (req, res, next) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json(missingFields(['id']));
    }

    const { name } = req.body as UpdateVendingMachineRequest;

    try {
      const vendingMachine = await prisma.vendingMachine.update({
        where: { id },
        data: {
          name,
        },
      });

      return res.json(vendingMachine);
    } catch (error) {
      console.error(error);
      next(error);
      return failedToUpdate('vending machine', error);
    }
  },
);

vendingMachinesRouter.delete<{ id: string }, VendingMachine | ErrorResponse>(
  '/:id',
  verifyRole(['admin']),
  async (req, res, next) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json(missingFields(['id']));
    }

    await prisma.slot
      .deleteMany({
        where: { vendingMachineId: id },
      })
      .then(() => {
        prisma.vendingMachine
          .delete({
            where: { id },
          })
          .then((vendingMachine) => {
            res.json(vendingMachine);
          });
      })
      .catch((error) => {
        console.error(error);
        next(error);
        return failedToDelete('vending machine', error);
      });
  },
);

export default vendingMachinesRouter;
