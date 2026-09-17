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
}
