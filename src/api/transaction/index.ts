/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/indent */
import express, { Request } from 'express';

import {
  failedToCreate,
  failedToDelete,
  failedToFetch,
  failedToUpdate,
  missingFields,
} from '../../utils/errorMessages';
import verifyRole from '../../middlewares/verifyRole';
import { Transaction } from '@prisma/client';
import ErrorResponse from '../../interfaces/ErrorResponse';
import { prisma } from '../../prismaClient';

const transactionsRouter = express.Router();

transactionsRouter.get<{}, Transaction[] | [] | ErrorResponse>(
  '/',
  async (req, res, next) => {
    try {
      const transactions = await prisma.transaction.findMany({
        select: {
          id: true,
          userId: true,
          slotId: true,
          createdAt: true,
          code: true,
          hasConfirmed: true,
          productId: true,
          vendingMachineId: true,
        },
      });
      return res.json(transactions);
    } catch (error) {
      console.error(error);
      next(error);
      return failedToFetch('transactions', error);
    }
  },
);

// get transactions by unique code
interface GetTransactionsByCodeRequest extends Request {
  body: {
    code: string;
  };
}

transactionsRouter.post<{}, Transaction | null | ErrorResponse>(
  '/by-code',
  async (req: GetTransactionsByCodeRequest, res, next) => {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json(missingFields(['code']));
    }

    try {
      const transactions = await prisma.transaction.findUnique({
        where: {
          code,
        },
        select: {
          id: true,
          userId: true,
          slotId: true,
          createdAt: true,
          code: true,
          hasConfirmed: true,
          productId: true,
          vendingMachineId: true,
        },
      });
      return res.json(transactions);
    } catch (error) {
      console.error(error);
      next(error);
      return failedToFetch('transactions', error);
    }
  },
);

// create transaction
interface CreateTransactionRequest extends Request {
  body: Pick<Transaction, 'userId' | 'slotId'>;
}

transactionsRouter.post<{}, Transaction | ErrorResponse>(
  '/',
  async (req: CreateTransactionRequest, res, next) => {
    const { userId, slotId } = req.body;

    if (!userId || !slotId) {
      return res.status(400).json(missingFields(['userId', 'slotId']));
    }

    try {
      // get the slot
      const slot = await prisma.slot.findUnique({
        where: {
          id: slotId,
        },
        select: {
          id: true,
          vendingMachineId: true,
          productId: true,
          stock: true,
        },
      });

      if (!slot) {
        return res.status(404).json({ message: 'Slot not found' });
      }
      //   less than 0 or no product
      if (slot.stock <= 0 || !slot.productId) {
        return res.status(400).json({ message: 'Slot is out of stock' });
      }

      // generate a 8 digit code
      const code = Math.floor(10000000 + Math.random() * 90000000);
      const hasConfirmed = false;

      // create transaction
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          slotId,
          code: code.toString(),
          hasConfirmed,
          productId: slot.productId,
          vendingMachineId: slot.vendingMachineId,
        },
      });

      return res.json(transaction);
    } catch (error) {
      console.error(error);
      next(error);
      return failedToCreate('transaction', error);
    }
  },
);

// confirm transaction
interface ConfirmTransactionRequest extends Request {
  body: {
    code: string;
  };
}

transactionsRouter.put<
  {},
  Pick<Transaction, 'id' | 'hasConfirmed'> | ErrorResponse
>('/confirm', async (req: ConfirmTransactionRequest, res, next) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json(missingFields(['code']));
  }

  try {
    const transaction = await prisma.transaction.findUnique({
      where: {
        code,
      },
      select: {
        id: true,
        hasConfirmed: true,
      },
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // return if transaction has already been confirmed
    return res.json(transaction);
  } catch (error) {
    console.error(error);
    next(error);
    return failedToUpdate('transaction', error);
  }
});

// cancel transaction with transaction cancel/:id
transactionsRouter.delete<{ id: string }, Transaction | ErrorResponse>(
  '/cancel/:id',
  async (req, res, next) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: 'Transaction ID is required' });
    }

    try {
      const transaction = await prisma.transaction.delete({
        where: { id },
        select: {
          id: true,
          userId: true,
          slotId: true,
          createdAt: true,
          code: true,
          hasConfirmed: true,
          productId: true,
          vendingMachineId: true,
        },
      });

      return res.json(transaction);
    } catch (error) {
      console.error(error);
      next(error);
      return failedToDelete('transaction', error);
    }
  },
);

export default transactionsRouter;
