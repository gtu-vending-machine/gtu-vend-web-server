import express from 'express';

import MessageResponse from '../interfaces/MessageResponse';

// routes import
import auth from '../middlewares/auth';
import verifyRole from '../middlewares/verifyRole';

import loginRouter from './login/login';
import signUpRouter from './signUp/signUp';
import usersRouter from './users/users';
import productsRouter from './products/products';
import dispensersRouter from './dispensers/dispensers';
import vendingMachinesRouter from './vendinMachines/vendinMachines';

const api = express.Router();

api.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
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
