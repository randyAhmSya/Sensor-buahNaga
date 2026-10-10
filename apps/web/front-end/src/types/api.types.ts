/**
 * Tipe Data Generik untuk API Backend Laravel SaaS AgroLight
 */

export interface ApiResponse<T = unknown> {
  status: 'succes' | 'success' | 'error' | string;
  pesan: string;
  data: T;
}

export interface ApiErrorResponse {
  status: 'error';
  pesan: string;
  errors?: Record<string, string[]>;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PaginatedApiResponse<T> {
  status: 'succes' | 'success' | 'error' | string;
  pesan: string;
  data: {
    data: T[];
    meta?: PaginationMeta;
  };
}

export type QueryParams = Record<string, string | number | boolean | undefined | null>;
