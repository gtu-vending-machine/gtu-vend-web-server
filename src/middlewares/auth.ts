// middlewares/auth.ts
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // remove 'Bearer ' from token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new Error('Unauthorized');
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.body = { ...req.body, user: decoded };
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Unauthorized' });
  }
};

export default auth;
