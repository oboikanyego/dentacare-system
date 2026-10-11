import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { TreatmentNote } from '../models/treatment-note.model';

@Injectable({ providedIn: 'root' })
export class TreatmentNoteService {
  private readonly api = inject(ApiService);

  create(payload: {
    appointmentId: string;
    diagnosis?: string;
    treatment?: string;
    prescription?: string;
    followUpDate?: string | null;
    notes?: string;
  }): Observable<TreatmentNote> {
    return this.api.post<TreatmentNote>(API_ENDPOINTS.treatmentNotes, payload);
  }

  listByEmail(email: string): Observable<TreatmentNote[]> {
    return this.api.get<TreatmentNote[]>(API_ENDPOINTS.treatmentNotes, { email });
  }

  listMine(): Observable<TreatmentNote[]> {
    return this.api.get<TreatmentNote[]>(`${API_ENDPOINTS.treatmentNotes}/mine`);
  }

  update(
    id: string,
    payload: Partial<
      Pick<TreatmentNote, 'diagnosis' | 'treatment' | 'prescription' | 'followUpDate' | 'notes'>
    >
  ): Observable<TreatmentNote> {
    return this.api.patch<TreatmentNote>(`${API_ENDPOINTS.treatmentNotes}/${id}`, payload);
  }
}
