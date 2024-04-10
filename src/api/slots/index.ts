/* eslint-disable @typescript-eslint/indent */
import express, { Request } from 'express';
import { prisma } from '../../prismaClient';
import ErrorResponse from '../../interfaces/ErrorResponse';
import { Slot } from '@prisma/client';

import {
  AddProductToSlotRequest,
  CreateSlotRequest,
  SlotDetails,
  UpdateSlotRequest,
} from '../../interfaces/Slot';
import {
  failedToCreate,
  failedToDelete,
  failedToFetch,
  failedToUpdate,
  missingFields,
} from '../../utils/errorMessages';
import verifyRole from '../../middlewares/verifyRole';

const slotsRouter = express.Router();

slotsRouter.get<{}, Slot[] | [] | ErrorResponse>(
  '/',
  async (req, res, next) => {
    try {
      const slots = await prisma.slot.findMany({
        select: {
          id: true,
          index: true,
          stock: true,
          productId: true,
          vendingMachineId: true,
        },
      });
      return res.json(slots);
    } catch (error) {
      console.error(error);
      next(error);
      return failedToFetch('slots', error);
    }
  },
);

interface GetSlotsByVendingMachineAndProductNameRequest extends Request {
  body: {
    vendingMachineId: number;
    productName: string;
  };
}

slotsRouter.post<{}, SlotDetails[] | [] | ErrorResponse>(
  '/by-vending-machine-and-product-name',

  async (req: GetSlotsByVendingMachineAndProductNameRequest, res, next) => {
    const { vendingMachineId, productName } = req.body;

    if (!vendingMachineId) {
      return res.status(400).json(missingFields(['vendingMachineId']));
    }
    //  if product name is not provided, return all slots
    const whereClause = productName
      ? {
          product: {
            name: {
              contains: productName,
            },
          },
        }
      : {};

    try {
      const slots = await prisma.slot.findMany({
        where: {
          vendingMachineId: Number(vendingMachineId),
          // product name includes productName
          ...whereClause,
        },
        select: {
          id: true,
          index: true,
          stock: true,
          productId: true,
          vendingMachineId: true,
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              image: true,
            },
          },
        },
      });

      return res.json(slots);
    } catch (error) {
      console.error(error);
      next(error);
      return failedToFetch('slots', error);
    }
  },
);

slotsRouter.get<{ id: string }, Slot | null | ErrorResponse>(
  '/:id',
  async (req, res, next) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json(missingFields(['id']));
    }

    try {
      const slot = await prisma.slot.findUnique({
        where: { id },
        select: {
          id: true,
          index: true,
          stock: true,
          productId: true,
          vendingMachineId: true,
        },
      });

      return res.json(slot);
    } catch (error) {
      console.error(error);
      next(error);
      return failedToFetch('slot', error);
    }
  },
);

slotsRouter.post<{}, Slot | ErrorResponse>(
  '/',
  verifyRole(['admin']),
  async (req, res, next) => {
    const { index, stock, productId, vendingMachineId } =
      req.body as CreateSlotRequest;

    // check if index, and vendingMachineId are provided
    if (index === undefined || vendingMachineId === undefined) {
      return res.status(400).json(missingFields(['index', 'vendingMachineId']));
    }

    try {
      const slot = await prisma.slot.create({
        data: {
          index,
          stock,
          productId,
          vendingMachineId,
        },
        select: {
          id: true,
          index: true,
          stock: true,
          productId: true,
          vendingMachineId: true,
        },
      });

      return res.json(slot);
    } catch (error) {
      console.error(error);
      next(error);
      return failedToCreate('slot', error);
    }
  },
);

slotsRouter.put<{ id: string }, Slot | ErrorResponse>(
  '/:id',
  verifyRole(['admin']),
  async (req, res, next) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Slot ID is required' });
    }

    const { index, stock, productId, vendingMachineId } =
      req.body as UpdateSlotRequest;

    try {
      const slot = await prisma.slot.update({
        where: { id },
        data: {
          index,
          stock,
          productId,
          vendingMachineId,
        },
        select: {
          id: true,
          index: true,
          stock: true,
          productId: true,
          vendingMachineId: true,
        },
      });

      return res.json(slot);
    } catch (error) {
      console.error(error);
      next(error);
      return failedToUpdate('slot', error);
    }
  },
);

slotsRouter.delete<{ id: string }, Slot | ErrorResponse>(
  '/:id',
  verifyRole(['admin']),
  async (req, res, next) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Slot ID is required' });
    }

    try {
      const slot = await prisma.slot.delete({
        where: { id },
        select: {
          id: true,
          index: true,
          stock: true,
          productId: true,
          vendingMachineId: true,
        },
      });

      return res.json(slot);
    } catch (error) {
      console.error(error);
      next(error);
      return failedToDelete('slot', error);
    }
  },
);

// add product to slot
slotsRouter.post<{ id: string }, Slot | ErrorResponse>(
  '/:id/product',
  verifyRole(['admin']),
  async (req: AddProductToSlotRequest, res, next) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Slot ID is required' });
    }

    const { productId, stock } = req.body;

    try {
      const slot = await prisma.slot.update({
        where: { id },
        data: {
          productId,
          stock,
        },
        select: {
          id: true,
          index: true,
          stock: true,
          productId: true,
          vendingMachineId: true,
        },
      });

      return res.json(slot);
    } catch (error) {
      console.error(error);
      next(error);
      return failedToUpdate('slot', error);
    }
  },
);

// delete product from slot
slotsRouter.delete<{ id: string }, Slot | ErrorResponse>(
  '/:id/product',
  verifyRole(['admin']),
  async (req, res, next) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Slot ID is required' });
    }

    try {
      const slot = await prisma.slot.update({
        where: { id },
        data: {
          productId: null,
          stock: 0,
        },
        select: {
          id: true,
          index: true,
          stock: true,
          productId: true,
          vendingMachineId: true,
        },
      });

      return res.json(slot);
    } catch (error) {
      console.error(error);
      next(error);
      return failedToUpdate('slot', error);
    }
  },
);

export default slotsRouter;
