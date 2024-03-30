import express from 'express';
import { prisma } from '../../prismaClient';
import ErrorResponse from '../../interfaces/ErrorResponse';
import { Dispenser } from '@prisma/client';
import {
  CreateDispenserRequest,
  UpdateDispenserRequest,
} from '../../interfaces/Dispenser';
import {
  failedToCreate,
  failedToDelete,
  failedToFetch,
  failedToUpdate,
  missingFields,
} from '../../utils/errorMessages';
import verifyRole from '../../middlewares/verifyRole';

const dispensersRouter = express.Router();

dispensersRouter.get<{}, Dispenser[] | [] | ErrorResponse>(
  '/',
  async (req, res, next) => {
    try {
      const dispensers = await prisma.dispenser.findMany({
        select: {
          id: true,
          index: true,
          stock: true,
          productId: true,
          vendingMachineId: true,
        },
      });
      return res.json(dispensers);
    } catch (error) {
      console.error(error);
      next(error);
      return failedToFetch('dispensers', error);
    }
  },
);

dispensersRouter.get<{ id: string }, Dispenser | null | ErrorResponse>(
  '/:id',
  async (req, res, next) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json(missingFields(['id']));
    }

    try {
      const dispenser = await prisma.dispenser.findUnique({
        where: { id },
        select: {
          id: true,
          index: true,
          stock: true,
          productId: true,
          vendingMachineId: true,
        },
      });

      return res.json(dispenser);
    } catch (error) {
      console.error(error);
      next(error);
      return failedToFetch('dispenser', error);
    }
  },
);

dispensersRouter.post<{}, Dispenser | ErrorResponse>(
  '/',
  verifyRole(['admin']),
  async (req, res, next) => {
    const { index, stock, productId, vendingMachineId } =
      req.body as CreateDispenserRequest;

    // check if index, and vendingMachineId are provided
    if (index === undefined || vendingMachineId === undefined) {
      return res.status(400).json(missingFields(['index', 'vendingMachineId']));
    }

    try {
      const dispenser = await prisma.dispenser.create({
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

      return res.json(dispenser);
    } catch (error) {
      console.error(error);
      next(error);
      return failedToCreate('dispenser', error);
    }
  },
);

dispensersRouter.put<{ id: string }, Dispenser | ErrorResponse>(
  '/:id',
  verifyRole(['admin']),
  async (req, res, next) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Dispenser ID is required' });
    }

    const { index, stock, productId, vendingMachineId } =
      req.body as UpdateDispenserRequest;

    try {
      const dispenser = await prisma.dispenser.update({
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

      return res.json(dispenser);
    } catch (error) {
      console.error(error);
      next(error);
      return failedToUpdate('dispenser', error);
    }
  },
);

dispensersRouter.delete<{ id: string }, Dispenser | ErrorResponse>(
  '/:id',
  verifyRole(['admin']),
  async (req, res, next) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Dispenser ID is required' });
    }

    try {
      const dispenser = await prisma.dispenser.delete({
        where: { id },
        select: {
          id: true,
          index: true,
          stock: true,
          productId: true,
          vendingMachineId: true,
        },
      });

      return res.json(dispenser);
    } catch (error) {
      console.error(error);
      next(error);
      return failedToDelete('dispenser', error);
    }
  },
);

export default dispensersRouter;
