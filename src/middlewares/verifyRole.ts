// middlewares/verifyRole.ts
import { NextFunction, Request, Response } from 'express';

type Role = 'admin' | 'user';

const verifyRole = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if user object exists from previous auth middleware
    // middlewares/auth.ts going to decode the JWT token and add the user object to the request body
    if (!req.body?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { role } = req.body.user;

    // Check if user role is included in allowed roles
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
};

export default verifyRole;
