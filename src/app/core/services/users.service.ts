import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { CreateUserRequest, UpdateUserRequest, UserListItem } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly api = inject(ApiService);

  list(): Observable<UserListItem[]> {
    return this.api.get<UserListItem[]>(API_ENDPOINTS.users);
  }

  create(payload: CreateUserRequest): Observable<unknown> {
    return this.api.post(API_ENDPOINTS.users, payload);
  }

  update(id: string, payload: UpdateUserRequest): Observable<unknown> {
    return this.api.patch(`${API_ENDPOINTS.users}/${id}`, payload);
  }

  setStatus(id: string, isActive: boolean): Observable<unknown> {
    return this.api.patch(`${API_ENDPOINTS.users}/${id}/status`, { isActive });
  }

  deactivate(id: string): Observable<unknown> {
    return this.api.delete(`${API_ENDPOINTS.users}/${id}`);
  }
}
