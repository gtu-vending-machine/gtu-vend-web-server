import express from 'express';
import { prisma } from '../../prismaClient';
import { UserResponse } from '../../interfaces/User';

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

export default usersRouter;
