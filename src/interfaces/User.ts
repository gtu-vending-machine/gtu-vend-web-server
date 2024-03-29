import MessageResponse from './MessageResponse';

type Role = 'admin' | 'user';
export default interface User {
  id: number;
  username: string;
  password: string;
  name: string;
  token?: string | null;
  role: Role;
}

interface LoginResponse extends MessageResponse {
  user: Pick<User, 'id' | 'token'>;
}

export { LoginResponse, Role };
