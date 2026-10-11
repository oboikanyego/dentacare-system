import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { MedicalProfile } from '../models/medical-profile.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class MedicalProfileService {
  private readonly api = inject(ApiService);

  getOwn(): Observable<MedicalProfile> {
    return this.api.get<MedicalProfile>(`${API_ENDPOINTS.users}/me/medical-profile`);
  }

  updateOwn(data: MedicalProfile): Observable<MedicalProfile> {
    return this.api.patch<MedicalProfile>(`${API_ENDPOINTS.users}/me/medical-profile`, data);
  }

  getForPatient(userId: string): Observable<MedicalProfile> {
    return this.api.get<MedicalProfile>(`${API_ENDPOINTS.users}/${userId}/medical-profile`);
  }

  updateForPatient(userId: string, data: MedicalProfile): Observable<MedicalProfile> {
    return this.api.patch<MedicalProfile>(`${API_ENDPOINTS.users}/${userId}/medical-profile`, data);
  }
}
