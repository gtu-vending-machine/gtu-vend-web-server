// utils/generateJwt.ts
import { User } from '@prisma/client';
import jwt from 'jsonwebtoken';
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const generateJwt = (user: User) => {
  const payload = { username: user.username, role: user.role };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: `${360 * 24 * 60}` }); // Set expiration to 360 days
};
