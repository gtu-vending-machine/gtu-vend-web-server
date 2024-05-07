import { User } from '@prisma/client';
import { Request } from 'express';

type Role = 'admin' | 'user' | 'machine';

type LoginRequest = Pick<User, 'username' | 'password'>;
type LoginResponse = {
  user: Pick<User, 'id' | 'username' | 'token' | 'role' | 'balance'>;
};

type SignUpRequest = Pick<User, 'username' | 'password' | 'name' | 'role'>;
type SignUpResponse = LoginResponse;

type UserResponse = Pick<User, 'id' | 'name' | 'username' | 'role' | 'balance'>;

interface BalanceUpdateRequest extends Request {
  body: {
    amount: number;
  };
}

interface AuthResponse {
  username: string;
  role: string;
  iat: string;
  exp: string;
}

export {
  LoginResponse,
  Role,
  LoginRequest,
  SignUpRequest,
  SignUpResponse,
  UserResponse,
  BalanceUpdateRequest,
  AuthResponse,
};
