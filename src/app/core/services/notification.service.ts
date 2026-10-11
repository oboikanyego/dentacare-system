import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { AppNotification } from '../models/notification.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly api = inject(ApiService);

  list(): Observable<AppNotification[]> {
    return this.api.get<AppNotification[]>(API_ENDPOINTS.notifications);
  }

  markRead(id: string): Observable<AppNotification> {
    return this.api.patch<AppNotification>(`${API_ENDPOINTS.notifications}/${id}/read`, {});
  }

  markAllRead(): Observable<{ updated: number }> {
    return this.api.patch<{ updated: number }>(`${API_ENDPOINTS.notifications}/read-all`, {});
  }
}
