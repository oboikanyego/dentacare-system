import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { Invoice, PaymentMethod } from '../models/invoice.model';

export interface CreateInvoicePayload {
  appointmentId: string;
  items: { description: string; quantity: number; unitPrice: number }[];
  taxRate?: number;
  dueDate?: string | null;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly api = inject(ApiService);

  create(payload: CreateInvoicePayload): Observable<Invoice> {
    return this.api.post<Invoice>(API_ENDPOINTS.invoices, payload);
  }

  listAll(params?: {
    email?: string;
    patientId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Observable<Invoice[]> {
    return this.api.get<Invoice[]>(API_ENDPOINTS.invoices, params as Record<string, string>);
  }

  listMine(): Observable<Invoice[]> {
    return this.api.get<Invoice[]>(`${API_ENDPOINTS.invoices}/mine`);
  }

  getById(id: string): Observable<Invoice> {
    return this.api.get<Invoice>(`${API_ENDPOINTS.invoices}/${id}`);
  }

  update(
    id: string,
    payload: { notes?: string; dueDate?: string | null; status?: string }
  ): Observable<Invoice> {
    return this.api.patch<Invoice>(`${API_ENDPOINTS.invoices}/${id}`, payload);
  }

  markPaid(id: string, paymentMethod: PaymentMethod): Observable<Invoice> {
    return this.api.patch<Invoice>(`${API_ENDPOINTS.invoices}/${id}/pay`, { paymentMethod });
  }
}
