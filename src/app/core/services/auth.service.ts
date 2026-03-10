import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserRole,
  AuthUser,
  ForgotPasswordRequest,
  ResetPasswordRequest
} from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  readonly currentUser = signal<AuthUser | null>(this.readStoredUser());

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse>(API_ENDPOINTS.auth.login, payload).pipe(
      tap((res) => this.persistSession(res))
    );
  }

  register(payload: RegisterRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse>(API_ENDPOINTS.auth.register, payload).pipe(
      tap((res) => this.persistSession(res))
    );
  }

  forgotPassword(payload: ForgotPasswordRequest): Observable<{ message: string }> {
    return this.api.post<{ message: string }>(API_ENDPOINTS.auth.forgotPassword, payload);
  }

  resetPassword(payload: ResetPasswordRequest): Observable<{ message: string }> {
    return this.api.post<{ message: string }>(API_ENDPOINTS.auth.resetPassword, payload);
  }

  getProfile(): Observable<AuthUser> {
    return this.api.get<AuthUser>(API_ENDPOINTS.auth.profile).pipe(
      tap((user) => {
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUser.set(user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser();
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(roles: UserRole[]): boolean {
    const role = this.currentUser()?.role;
    return !!role && roles.includes(role);
  }

  getLandingRoute(): string {
    const role = this.currentUser()?.role;
    switch (role) {
      case 'PATIENT':
        return '/patient/appointments';
      case 'RECEPTIONIST':
      case 'DENTIST':
        return '/staff/bookings';
      case 'ADMIN':
        return '/admin/users';
      default:
        return '/';
    }
  }

  private persistSession(res: LoginResponse): void {
    if (res?.token) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      this.currentUser.set(res.user);
    }
  }

  private readStoredUser(): AuthUser | null {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) as AuthUser : null;
  }
}
