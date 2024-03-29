import express from 'express';

import MessageResponse from '../interfaces/MessageResponse';

// routes import
import users from './users/users';
import signUp from './signUp/signUp';
import login from './login/login';
import auth from '../middlewares/auth';
import verifyRole from '../middlewares/verifyRole';

const router = express.Router();

router.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

// other routes will be added here to the router
router.use('/users', auth, verifyRole(['admin']), users);
router.use('/signUp', signUp);
router.use('/login', login);

export default router;
