/* eslint-disable @typescript-eslint/indent */
import express from 'express';
import { prisma } from '../../prismaClient';
import {
  BalanceUpdateRequest,
  UserResponse,
  QueryUsersRequest,
} from '../../interfaces/User';
import ErrorResponse from '../../interfaces/ErrorResponse';
import { FilterOption } from '../../interfaces/Filter';

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

// user response with counts
interface UserResponseWithCount {
  users: UserResponse[];
  count: number;
}
usersRouter.post<{}, UserResponseWithCount | []>(
  '/query',
  async (req: QueryUsersRequest, res, next) => {
    const { query } = req.body;
    const { filter, pagination, sort } = query;

    const filterOption: FilterOption[] = [
      'eq',
      'gt',
      'lt',
      'contains',
      'startsWith',
    ];

    const fields = ['id', 'name', 'username', 'role', 'balance'];

    try {
      const whereClause: Record<string, any> = {}; // Initialize empty filter object

      // Build the where clause based on filter input (if provided)
      if (filter) {
        filter.forEach((f) => {
          // Ensure valid field names and options

          if (!fields.includes(f.field) || !filterOption.includes(f.option)) {
            return; // Skip invalid filters
          }
          switch (f.option) {
            case 'eq':
              whereClause[f.field] = f.value;
              break;
            case 'gt':
              whereClause[f.field] = { gt: f.value };
              break;
            case 'lt':
              whereClause[f.field] = { lt: f.value };
              break;
            case 'contains':
              whereClause[f.field] = { contains: f.value };
              break;
            case 'startsWith':
              whereClause[f.field] = { startsWith: f.value };
              break;
          }
        });
      }

      // Handle pagination logic
      const { page = 1, pageSize = 5 } = pagination || {}; // Set defaults
      const skip = (page - 1) * pageSize; // Calculate skip offset

      const users = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          balance: true,
        },
        skip: skip,
        take: pageSize,
        orderBy: sort ? { [sort.field]: sort.order } : undefined,
      });

      // get the total count of users with the applied filters (without pagination)
      const count = await prisma.user.count({
        where: whereClause,
      });

      res.json({ users, count });
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

export default usersRouter;
