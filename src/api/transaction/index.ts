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
          product: {
            select: {
              price: true,
            },
          },
        },
      });

      if (!slot || !slot.product) {
        return res.status(404).json({ message: 'Slot or product not found' });
      }
      //   less than 0 or no product
      if (slot.stock <= 0 || !slot.productId) {
        return res.status(400).json({ message: 'Slot is out of stock' });
      }

      // get user balance
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          balance: true,
        },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // check if user has enough balance
      if (user.balance < slot.product.price) {
        return res.status(400).json({ message: 'Insufficient balance' });
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
        vendingMachineId: true,
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
      // check if transaction exist and not confirmed
      const checkTransaction = await prisma.transaction.findUnique({
        where: { id },
        select: {
          id: true,
          hasConfirmed: true,
        },
      });

      if (!checkTransaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      if (checkTransaction.hasConfirmed) {
        return res
          .status(400)
          .json({ message: 'Transaction already approved' });
      }

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

interface ApproveTransactionRequest extends Request {
  body: {
    code: string;
    vendingMachineId: number;
  };
}

// approve transaction with transaction with code
transactionsRouter.put<
  {},
  Pick<Transaction, 'id' | 'hasConfirmed'> | ErrorResponse
>(
  '/approve',
  verifyRole(['admin', 'machine']),
  async (req: ApproveTransactionRequest, res, next) => {
    const { code, vendingMachineId } = req.body;

    if (!code) {
      return res.status(400).json(missingFields(['code']));
    }

    try {
      // get transaction
      const checkTransaction = await prisma.transaction.findUnique({
        where: {
          code,
        },
        select: {
          id: true,
          hasConfirmed: true,
          vendingMachineId: true,
        },
      });

      if (!checkTransaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      // check if vending machine id matches
      if (checkTransaction.vendingMachineId !== vendingMachineId) {
        return res.status(400).json({ message: 'Invalid vending machine' });
      }

      // return if transaction has already been confirmed
      if (checkTransaction.hasConfirmed) {
        return res
          .status(400)
          .json({ message: 'Transaction already approved' });
      }

      const transaction = await prisma.transaction.update({
        where: {
          code,
        },
        data: {
          hasConfirmed: true,
        },
        select: {
          id: true,
          hasConfirmed: true,
          userId: true,
          slot: {
            select: {
              stock: true,
              id: true,
              index: true,
            },
          },
          product: {
            select: {
              price: true,
            },
          },
        },
      });

      // if not enough stock
      if (transaction.slot.stock <= 0) {
        return res.status(400).json({ message: 'Slot is out of stock' });
      }

      // update stock and user balance
      await prisma.slot.update({
        where: {
          id: transaction.slot.id,
        },
        data: {
          stock: {
            decrement: 1,
          },
        },
      });

      await prisma.user.update({
        where: {
          id: transaction.userId,
        },
        data: {
          balance: {
            decrement: transaction.product.price,
          },
        },
      });

      return res.json(transaction);
    } catch (error) {
      console.error(error);
      next(error);
      return failedToUpdate('transaction', error);
    }
  },
);

export default transactionsRouter;
