import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { MasterDataResponse, MasterDataItem } from '../models/master-data.model';

@Injectable({ providedIn: 'root' })
export class MasterDataService {
  private readonly api = inject(ApiService);

  getMany(keys: string[]): Observable<MasterDataResponse> {
    return this.api.get<MasterDataResponse>(API_ENDPOINTS.masterData, {
      keys: keys.join(',')
    });
  }

  getOne(key: string): Observable<{ key: string; description: string; items: MasterDataItem[] }> {
    return this.api.get<{ key: string; description: string; items: MasterDataItem[] }>(`${API_ENDPOINTS.masterData}/${key}`);
  }
}
