/* eslint-disable @typescript-eslint/indent */
import express from 'express';
import { prisma } from '../../prismaClient';
import { BalanceUpdateRequest, UserResponse } from '../../interfaces/User';
import ErrorResponse from '../../interfaces/ErrorResponse';
import { QueryRequest } from '../../interfaces/Filter';
import { failedToFetch, missingFields } from '../../utils/errorMessages';
import { User } from '@prisma/client';
import { getWhereClause } from '../../utils/getWhereClause';

const usersRouter = express.Router();

usersRouter.get<{}, UserResponse[] | []>('/', (req, res, next) => {
  try {
    prisma.user
      .findMany({
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          balance: true,
        },
      })
      .then((users) => {
        res.json(users);
      });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

usersRouter.get<{ id: string }, UserResponse | null>(
  '/:id',
  (req, res, next) => {
    const { id } = req.params;
    try {
      prisma.user
        .findUnique({
          where: { id: Number(id) },
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
            balance: true,
          },
        })
        .then((user) => {
          res.json(user);
        });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
);

// user response with counts
interface UserResponseWithCount {
  users: UserResponse[];
  count: number;
}

usersRouter.post<{}, UserResponseWithCount | [] | ErrorResponse>(
  '/query',
  async (req: QueryRequest<User>, res, next) => {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json(missingFields(['query']));
    }

    const { filter, pagination, sort } = query;

    const fields: (keyof User)[] = [
      'id',
      'name',
      'username',
      'role',
      'balance',
    ];

    // get where clause for filtering
    const whereClause = getWhereClause<User>(filter, fields);

    // Handle pagination logic
    const { page = 1, pageSize = 5 } = pagination || {}; // Set defaults
    const skip = (page - 1) * pageSize; // Calculate skip offset

    prisma.user
      .findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          balance: true,
        },
        orderBy: sort
          ? {
              [sort.field]: sort.order,
            }
          : undefined,
        skip,
        take: pageSize,
      })
      .then((users) => {
        prisma.user
          .count({
            where: whereClause,
          })
          .then((count) => {
            res.json({ users, count });
          });
      })
      .catch((error) => {
        console.error(error);
        next(error);
        return failedToFetch('users', error);
      });
  },
);

// DELETE /users/:id
usersRouter.delete<{ id: string }, UserResponse | ErrorResponse>(
  '/:id',
  async (req, res, next) => {
    const { id } = req.params;
    try {
      // check if user exists and not admin
      const userToDelete = await prisma.user.findUnique({
        where: { id: Number(id) },
        select: {
          role: true,
        },
      });

      if (!userToDelete) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (userToDelete.role === 'admin') {
        return res.status(403).json({
          message: 'Admin cannot be deleted',
        });
      }

      const user = await prisma.user.delete({
        where: { id: Number(id) },
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          balance: true,
        },
      });
      return res.json(user);
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
);

usersRouter.post<
  { id: string },
  Pick<UserResponse, 'balance' | 'id'> | ErrorResponse
>('/:id/addBalance', async (req: BalanceUpdateRequest, res, next) => {
  const { id } = req.params;
  const { amount } = req.body;

  try {
    // get users current balance
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        balance: true,
      },
    });

    // if user does not exist, throw an error
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: { balance: user.balance + amount },
      select: {
        id: true,
        balance: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// reset balance
usersRouter.post<
  { id: string },
  Pick<UserResponse, 'balance' | 'id'> | ErrorResponse
>('/:id/resetBalance', async (req, res, next) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        balance: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: { balance: 0 },
      select: {
        id: true,
        balance: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

export default usersRouter;
