import express from 'express';
import { prisma } from '../../prismaClient';
import {
  BalanceUpdateRequest,
  UserResponse,
  FilteredUsersRequest,
} from '../../interfaces/User';
import ErrorResponse from '../../interfaces/ErrorResponse';
import { FilterOptions } from '../../interfaces/Filter';
import { sortFunction } from '../../utils/sortFunction';

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

usersRouter.post<{}, UserResponse[] | []>(
  '/filtered',
  async (req: FilteredUsersRequest, res, next) => {
    const { query } = req.body;
    const { filter, pagination, sort } = query;

    const filterOptions: FilterOptions[] = [
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

          if (!fields.includes(f.field) || !filterOptions.includes(f.option)) {
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
      const { page = 1, pageSize = 10 } = pagination || {}; // Set defaults
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
      });

      // sort the users based on the sort input (if provided)
      // i don't use orderBy since it is case sensitive
      sortFunction<UserResponse>(sort, users);

      res.json(users);
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
);

usersRouter.post<{ id: string }, Omit<UserResponse, 'role'> | ErrorResponse>(
  '/:id/addBalance',
  async (req: BalanceUpdateRequest, res, next) => {
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
          name: true,
          username: true,
          balance: true,
        },
      });

      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
);

export default usersRouter;
