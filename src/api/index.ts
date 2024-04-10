import express from 'express';

import MessageResponse from '../interfaces/MessageResponse';

// routes import
import auth from '../middlewares/auth';
import verifyRole from '../middlewares/verifyRole';

import loginRouter from './login';
import signUpRouter from './signUp';
import usersRouter from './users';
import productsRouter from './products';
import slotsRouter from './slots';
import vendingMachinesRouter from './vendingMachines';
import { AuthResponse } from '../interfaces/User';
import transactionsRouter from './transaction';

const api = express.Router();

api.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

api.get<{}, AuthResponse | MessageResponse>('/auth', auth, (req, res) => {
  const iat = new Date(req.body.user.iat * 1000).toUTCString(); // issued at
  const exp = new Date(req.body.user.exp * 1000).toUTCString(); // expiration
  res.json({
    ...req.body.user,
    iat,
    exp,
  });
});

// other routes will be added here to the api
api.use('/users', auth, verifyRole(['admin']), usersRouter);
api.use('/signUp', signUpRouter);
api.use('/login', loginRouter);
api.use('/products', auth, verifyRole(['admin', 'user']), productsRouter);
api.use('/slots', auth, verifyRole(['admin', 'user']), slotsRouter);
api.use(
  '/vendingMachines',
  auth,
  verifyRole(['admin', 'user']),
  vendingMachinesRouter,
);

api.use(
  '/transactions',
  auth,
  verifyRole(['admin', 'user']),
  transactionsRouter,
);

export default api;
