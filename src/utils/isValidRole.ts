import { Role } from '../interfaces/User';

const validRoles: Role[] = ['admin', 'user', 'machine'];

export const isValidRole = (role: string): boolean => {
  return validRoles.includes(role as Role);
};
