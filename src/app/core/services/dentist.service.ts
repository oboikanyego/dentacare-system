import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { Dentist } from '../models/dentist.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class DentistService {
  private readonly api = inject(ApiService);

  getDentists(search = '', limit = 20): Observable<Dentist[]> {
    return this.api.get<Dentist[]>(API_ENDPOINTS.dentists, { search, limit });
  }

  getDentistById(id: string): Observable<Dentist> {
    return this.api.get<Dentist>(`${API_ENDPOINTS.dentists}/${id}`);
  }
}
