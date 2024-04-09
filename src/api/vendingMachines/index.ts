/* eslint-disable @typescript-eslint/indent */
import express from 'express';
import { prisma } from '../../prismaClient';
import ErrorResponse from '../../interfaces/ErrorResponse';
import { VendingMachine, Slot } from '@prisma/client';

import {
  CreateVendingMachineRequest,
  UpdateVendingMachineRequest,
} from '../../interfaces/VendingMachines';

import {
  failedToCreate,
  failedToDelete,
  failedToFetch,
  failedToUpdate,
  missingFields,
} from '../../utils/errorMessages';
import verifyRole from '../../middlewares/verifyRole';

const vendingMachinesRouter = express.Router();

vendingMachinesRouter.get<{}, VendingMachine[] | [] | ErrorResponse>(
  '/',
  async (req, res, next) => {
    try {
      const vendingMachines = await prisma.vendingMachine.findMany({
        select: {
          id: true,
          name: true,
          slots: {
            select: {
              id: true,
              index: true,
              stock: true,
              productId: true,
            },
          },
        },
      });
      return res.json(vendingMachines);
    } catch (error) {
      console.error(error);
      next(error);
      return failedToFetch('vending machines', error);
    }
  },
);

vendingMachinesRouter.get<
  { id: string },
  VendingMachine | null | ErrorResponse
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
            productId: true,
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

// if slotNumber is provided, create slots
// and connect them to the vending machine, otherwise
// create only the vending machine
vendingMachinesRouter.post<{}, VendingMachine | ErrorResponse | null>(
  '/',
  verifyRole(['admin']),
  async (req, res, next) => {
    const { name } = req.body as CreateVendingMachineRequest;

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

      // get slotNumber from query params
      // usage: /vendingMachines?slotNumber=3
      const slotNumber = Number(req.query.slotNumber);

      // create slots and connect them to vending machine
      if (slotNumber) {
        const slots: Slot[] = [];
        for (let i = 0; i < slotNumber; i++) {
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

    try {
      const vendingMachine = await prisma.vendingMachine.delete({
        where: { id },
      });

      return res.json(vendingMachine);
    } catch (error) {
      console.error(error);
      next(error);
      return failedToDelete('vending machine', error);
    }
  },
);

export default vendingMachinesRouter;
