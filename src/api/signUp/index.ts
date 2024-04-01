import express from 'express';
import { prisma } from '../../prismaClient';
import ErrorResponse from '../../interfaces/ErrorResponse';
import { generateJwt } from '../../utils/generateJwt';
import { hashPassword } from '../../utils/hashPassword';
import { SignUpRequest, SignUpResponse } from '../../interfaces/User';
import { invalidRole, missingFields } from '../../utils/errorMessages';
import { isValidRole } from '../../utils/isValidRole';

const signUpRouter = express.Router();

signUpRouter.post<{}, SignUpResponse | ErrorResponse, SignUpRequest>(
  '/',
  async (req, res, next) => {
    const { username, password, name, role } = req.body;

    if (!username || !password || !name) {
      return res
        .status(400)
        .json(missingFields(['username', 'password', 'name']));
    }

    // check if role is given and it is valid
    if (role && !isValidRole(role)) {
      return res.status(400).json(invalidRole(role));
    }

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
      const token = generateJwt({ ...user, role: user.role });

      // Update user record to store token (optional)
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

export default signUpRouter;
