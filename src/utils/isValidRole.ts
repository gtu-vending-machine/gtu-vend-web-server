import { Role } from '../interfaces/User';

const validRoles: Role[] = ['admin', 'user'];

export const isValidRole = (role: string): boolean => {
  return validRoles.includes(role as Role);
};
