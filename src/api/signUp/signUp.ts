import express from 'express';
import { prisma } from '../../prismaClient';
import ErrorResponse from '../../interfaces/ErrorResponse';
import { generateJwt } from '../../utils/generateJwt';
import { hashPassword } from '../../utils/hashPassword';
import User, { LoginResponse, Role } from '../../interfaces/User';

const router = express.Router();

type SignUpRequest = Pick<User, 'username' | 'password' | 'name' | 'role'>;
type SignUpResponse = LoginResponse;

router.post<{}, SignUpResponse | ErrorResponse, SignUpRequest>(
  '/',
  async (req, res, next) => {
    const { username, password, name, role } = req.body;

    try {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const hashedPassword = await hashPassword(password);

      // Create the user record (without token initially)
      const user = await prisma.user.create({
        data: {
          name: name,
          username: username,
          password: hashedPassword,
          role: role,
        },
      });

      // Generate JWT token with user information and expiration time
      const token = generateJwt({ ...user, role: user.role as Role });

      // Update user record to store token (optional)
      await prisma.user.update({ where: { id: user.id }, data: { token } });

      return res.json({
        message: 'Signup successful',
        user: {
          id: user.id,
          token,
        },
      });
    } catch (error) {
      console.error(error);
      // res.status(500).json({ message: 'Internal server error' });
      next(error);
    }
  },
);

export default router;
