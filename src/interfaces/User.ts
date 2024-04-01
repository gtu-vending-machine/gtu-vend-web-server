import { User } from '@prisma/client';

type Role = 'admin' | 'user';

type LoginRequest = Pick<User, 'username' | 'password'>;
type LoginResponse = {
  user: Pick<User, 'id' | 'username' | 'token' | 'role'>;
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
