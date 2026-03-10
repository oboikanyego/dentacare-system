export type UserRole = 'PATIENT' | 'RECEPTIONIST' | 'DENTIST' | 'ADMIN';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive?: boolean;
  phone?: string;
  idNumber?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone?: string;
  idNumber: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: AuthUser;
}
