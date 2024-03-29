import { NextFunction, Request, Response } from 'express';

import ErrorResponse from '../interfaces/ErrorResponse';

// export default function errorHandler(
const errorHandler = (
  err: Error,
  req: Request,
  res: Response<ErrorResponse>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });

  if (next) {
    next();
  }
};

export default errorHandler;
