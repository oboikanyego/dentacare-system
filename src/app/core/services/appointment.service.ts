import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { Appointment } from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly api = inject(ApiService);

  listStaffAppointments(): Observable<Appointment[]> {
    return this.api.get<Appointment[]>(API_ENDPOINTS.appointments);
  }

  listMyAppointments(): Observable<Appointment[]> {
    return this.api.get<Appointment[]>(`${API_ENDPOINTS.appointments}/mine`);
  }

  createPublicAppointment(payload: Appointment): Observable<Appointment> {
    return this.api.post<Appointment>(API_ENDPOINTS.appointments, payload);
  }

  createMyAppointment(payload: Appointment): Observable<Appointment> {
    return this.api.post<Appointment>(`${API_ENDPOINTS.appointments}/mine`, payload);
  }

  createStaffAppointment(payload: Appointment): Observable<Appointment> {
    return this.api.post<Appointment>(`${API_ENDPOINTS.appointments}/staff`, payload);
  }

  updateAppointment(id: string, payload: Partial<Appointment> & { auditNote?: string }): Observable<{ message: string; appointment: Appointment }> {
    return this.api.patch<{ message: string; appointment: Appointment }>(`${API_ENDPOINTS.appointments}/${id}`, payload);
  }

  updateMyAppointment(id: string, payload: Partial<Appointment> & { auditNote?: string }): Observable<{ message: string; appointment: Appointment }> {
    return this.api.patch<{ message: string; appointment: Appointment }>(`${API_ENDPOINTS.appointments}/mine/${id}`, payload);
  }

  cancelMyAppointment(id: string, cancelReason = 'Cancelled by patient'): Observable<{ message: string; appointment: Appointment }> {
    return this.api.patch<{ message: string; appointment: Appointment }>(`${API_ENDPOINTS.appointments}/mine/${id}/cancel`, { cancelReason });
  }

  cancelStaffAppointment(id: string, cancelReason = 'Cancelled by staff'): Observable<{ message: string; appointment: Appointment }> {
    return this.api.patch<{ message: string; appointment: Appointment }>(`${API_ENDPOINTS.appointments}/${id}/cancel`, { cancelReason });
  }
}
