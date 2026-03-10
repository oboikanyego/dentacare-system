import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { Dentist } from '../models/dentist.model';

@Injectable({
  providedIn: 'root'
})
export class DentistService {
  private readonly api = inject(ApiService);

  getDentists(): Observable<Dentist[]> {
    return this.api.get<Dentist[]>(API_ENDPOINTS.dentists);
  }

  getDentistById(id: string): Observable<Dentist> {
    return this.api.get<Dentist>(`${API_ENDPOINTS.dentists}/${id}`);
  }
}