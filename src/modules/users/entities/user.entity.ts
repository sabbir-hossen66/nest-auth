export interface User {
  id: number;
  email: string;
  name: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

export type SafeUser = Omit<User, 'password'>;
