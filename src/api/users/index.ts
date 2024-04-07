import express from 'express';
import { prisma } from '../../prismaClient';
import { UserResponse } from '../../interfaces/User';
import ErrorResponse from '../../interfaces/ErrorResponse';

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

// add balance to user by id and amount in body
usersRouter.post<{ id: string }, Omit<UserResponse, 'role'> | ErrorResponse>(
  '/:id/addBalance',
  async (req, res, next) => {
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
