import express from 'express';
import { prisma } from '../../prismaClient';
import ErrorResponse from '../../interfaces/ErrorResponse';
import { generateJwt } from '../../utils/generateJwt';
import bcrypt from 'bcryptjs';
import { LoginRequest, LoginResponse } from '../../interfaces/User';
import { missingFields } from '../../utils/errorMessages';

const loginRouter = express.Router();

const invalidUsernameOrPassword = (res: express.Response) => {
  return res.status(401).json({ message: 'Invalid username or password' });
};

loginRouter.post<{}, LoginResponse | ErrorResponse, LoginRequest>(
  '/',
  async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json(missingFields(['username', 'password']));
    }

    try {
      const user = await prisma.user.findUnique({
        where: { username },
      });

      if (!user) {
        return invalidUsernameOrPassword(res);
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return invalidUsernameOrPassword(res);
      }

      // cast user.role to Role, if it's not a valid Role, it will throw an error
      const role = user.role;

      // Generate a JWT token
      const token = generateJwt({ ...user, role });

      await prisma.user.update({ where: { id: user.id }, data: { token } });

      return res.json({
        user: {
          id: user.id,
          token,
          role: user.role,
          username: user.username,
        },
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
);

export default loginRouter;
