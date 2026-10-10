import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { MasterDataItem, MasterDataResponse } from '../models/master-data.model';
import { ApiService } from './api.service';

export interface MasterDataListResponse {
  key: string;
  description: string;
  items: MasterDataItem[];
}

@Injectable({ providedIn: 'root' })
export class MasterDataService {
  private readonly api = inject(ApiService);

  getMany(keys: string[]): Observable<MasterDataResponse> {
    return this.api.get<MasterDataResponse>(API_ENDPOINTS.masterData, {
      keys: keys.join(',')
    });
  }

  getOne(key: string): Observable<MasterDataListResponse> {
    return this.search(key);
  }

  search(key: string, search = '', limit = 20): Observable<MasterDataListResponse> {
    return this.api.get<MasterDataListResponse>(`${API_ENDPOINTS.masterData}/${key}`, {
      search,
      limit
    });
  }

  addItem(
    key: string,
    item: { value: string; label: string; metadata?: Record<string, unknown>; sortOrder?: number }
  ): Observable<MasterDataListResponse> {
    return this.api.post<MasterDataListResponse>(`${API_ENDPOINTS.masterData}/${key}/items`, item);
  }

  updateItem(
    key: string,
    value: string,
    updates: {
      label?: string;
      isActive?: boolean;
      sortOrder?: number;
      metadata?: Record<string, unknown>;
    }
  ): Observable<MasterDataListResponse> {
    return this.api.patch<MasterDataListResponse>(
      `${API_ENDPOINTS.masterData}/${key}/items/${encodeURIComponent(value)}`,
      updates
    );
  }

  deactivateItem(key: string, value: string): Observable<{ message: string; key: string }> {
    return this.api.delete<{ message: string; key: string }>(
      `${API_ENDPOINTS.masterData}/${key}/items/${encodeURIComponent(value)}`
    );
  }
}
