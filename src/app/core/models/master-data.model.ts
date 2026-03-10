export interface MasterDataItem {
  value: string;
  label: string;
  metadata?: Record<string, unknown>;
  sortOrder?: number;
  isActive?: boolean;
}

export type MasterDataResponse = Record<string, MasterDataItem[]>;
