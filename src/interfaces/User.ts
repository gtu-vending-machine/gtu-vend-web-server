import { User } from '@prisma/client';
import MessageResponse from './MessageResponse';

type Role = 'admin' | 'user';

type LoginRequest = Pick<User, 'username' | 'password'>;
type LoginResponse = MessageResponse & {
  user: Pick<User, 'id' | 'token' | 'role'>;
};

type SignUpRequest = Pick<User, 'username' | 'password' | 'name' | 'role'>;
type SignUpResponse = LoginResponse;

type UserResponse = Pick<User, 'id' | 'name' | 'username' | 'role' | 'balance'>;

export {
  LoginResponse,
  Role,
  LoginRequest,
  SignUpRequest,
  SignUpResponse,
  UserResponse,
};
