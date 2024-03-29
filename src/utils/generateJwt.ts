// utils/generateJwt.ts
import jwt from 'jsonwebtoken';
import User from '../interfaces/User';
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const generateJwt = (user: User) => {
  const payload = { username: user.username, role: user.role };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30m' }); // Set expiration to 30 minutes
};
