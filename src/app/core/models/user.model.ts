import { UserRole } from './auth.model';

export interface UserListItem {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  idNumber?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  idNumber: string;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  role?: UserRole;
  phone?: string;
  idNumber?: string;
  isActive?: boolean;
}
