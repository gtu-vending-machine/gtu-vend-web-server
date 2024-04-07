import { User } from '@prisma/client';
import { Request } from 'express';
import { Filter, Pagination, Sort } from './Filter';

type Role = 'admin' | 'user';

type LoginRequest = Pick<User, 'username' | 'password'>;
type LoginResponse = {
  user: Pick<User, 'id' | 'username' | 'token' | 'role'>;
};

type SignUpRequest = Pick<User, 'username' | 'password' | 'name' | 'role'>;
type SignUpResponse = LoginResponse;

type UserResponse = Pick<User, 'id' | 'name' | 'username' | 'role' | 'balance'>;

interface BalanceUpdateRequest extends Request {
  body: {
    amount: number;
  };
}

// combine FilterByUser with sort and pagination
type UserFilter = Filter & Sort & Pagination;

// filtered users
interface FilteredUsersRequest extends Request {
  body: {
    query: UserFilter;
  };
}

export {
  LoginResponse,
  Role,
  LoginRequest,
  SignUpRequest,
  SignUpResponse,
  UserResponse,
  BalanceUpdateRequest,
  UserFilter,
  FilteredUsersRequest,
};
