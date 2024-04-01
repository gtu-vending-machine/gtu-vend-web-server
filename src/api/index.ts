import express from 'express';

import MessageResponse from '../interfaces/MessageResponse';

// routes import
import auth from '../middlewares/auth';
import verifyRole from '../middlewares/verifyRole';

import loginRouter from './login';
import signUpRouter from './signUp';
import usersRouter from './users';
import productsRouter from './products';
import dispensersRouter from './dispensers';
import vendingMachinesRouter from './vendinMachines';

const api = express.Router();

api.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

api.get<{}, MessageResponse>('/auth', auth, (req, res) => {
  res.json(req.body.user);
});

// other routes will be added here to the api
api.use('/users', auth, verifyRole(['admin']), usersRouter);
api.use('/signUp', signUpRouter);
api.use('/login', loginRouter);
api.use('/products', auth, verifyRole(['admin', 'user']), productsRouter);
api.use('/dispensers', auth, verifyRole(['admin', 'user']), dispensersRouter);
api.use(
  '/vendingMachines',
  auth,
  verifyRole(['admin', 'user']),
  vendingMachinesRouter,
);

export default api;
