import express from 'express';
import { prisma } from '../../prismaClient';
import ErrorResponse from '../../interfaces/ErrorResponse';
import { Slot } from '@prisma/client';
import { CreateSlotRequest, UpdateSlotRequest } from '../../interfaces/Slot';
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

export default slotsRouter;
