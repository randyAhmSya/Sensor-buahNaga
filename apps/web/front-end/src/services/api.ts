import type { QueryParams } from '@/types/api.types';

/**
 * Base API Client with Interceptors, Token Auth & Robust Error Handling
 * Specially tailored for Laravel Sanctum REST API backend.
 */

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: BodyInit | null;
  params?: QueryParams;
  timeout?: number;
}

export class ApiError extends Error {
  status: number;
  pesan: string;
  errors?: Record<string, string[]>;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.pesan = message;

    if (data && typeof data === 'object') {
      const errObj = data as Record<string, unknown>;
      if (typeof errObj.pesan === 'string') {
        this.pesan = errObj.pesan;
        this.message = errObj.pesan;
      } else if (typeof errObj.message === 'string') {
        this.pesan = errObj.message;
        this.message = errObj.message;
      }

      if (errObj.errors && typeof errObj.errors === 'object') {
        this.errors = errObj.errors as Record<string, string[]>;
      }
    }
  }
}

/**
 * Helper untuk mengecek status sukses respons API Laravel AgroLight ('succes' atau 'success')
 */
export const isApiSuccess = (res: unknown): boolean => {
  if (!res || typeof res !== 'object') return false;
  const status = (res as { status?: string }).status;
  return status === 'succes' || status === 'success';
};

type RequestInterceptor = (config: ApiRequestOptions) => ApiRequestOptions | Promise<ApiRequestOptions>;
type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

export class ApiClient {
  private baseUrl: string;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(baseUrl?: string) {
    const defaultUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) 
      ? import.meta.env.VITE_API_BASE_URL 
      : 'http://localhost:8000/api';
    this.baseUrl = (baseUrl || defaultUrl).replace(/\/+$/, '');
  }

  useRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
  }

  useResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
  }

  async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    let finalOptions: ApiRequestOptions = { ...options };

    for (const interceptor of this.requestInterceptors) {
      finalOptions = await interceptor(finalOptions);
    }

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    let url = `${this.baseUrl}${cleanEndpoint}`;

    if (finalOptions.params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(finalOptions.params)) {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    const isFormData = typeof FormData !== 'undefined' && finalOptions.body instanceof FormData;

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...((finalOptions.headers as Record<string, string>) || {}),
    };

    if (!isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('agro_auth_token') : null;
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), finalOptions.timeout || 20000);

    try {
      let response = await fetch(url, {
        ...finalOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      for (const interceptor of this.responseInterceptors) {
        response = await interceptor(response);
      }

      if (!response.ok) {
        let errorData: unknown;
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
        }

        if (response.status === 401 && typeof window !== 'undefined') {
          // Token expired or invalid
          localStorage.removeItem('agro_auth_token');
          localStorage.removeItem('agro_auth_user');
          if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
            window.location.href = '/login';
          }
        }

        const fallbackMsg = `Permintaan gagal dengan status ${response.status}`;
        throw new ApiError(fallbackMsg, response.status, errorData);
      }

      const parsedJson = await response.json();
      return parsedJson as T;
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      if (error instanceof ApiError) throw error;
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError('Koneksi timeout, server tidak merespons tepat waktu', 408);
      }
      throw new ApiError((error as Error)?.message || 'Koneksi ke server gagal', 500);
    }
  }

  get<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<T> {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? data : (data !== undefined ? JSON.stringify(data) : undefined),
    });
  }

  put<T>(endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<T> {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? data : (data !== undefined ? JSON.stringify(data) : undefined),
    });
  }

  patch<T>(endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<T> {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: isFormData ? data : (data !== undefined ? JSON.stringify(data) : undefined),
    });
  }

  delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

export { farmService } from './farmService';
export { blockService } from './blockService';
export { harvestService } from './harvestService';
export { sensorService } from './sensorService';
export { gatewayService } from './gatewayService';
export { qrCodeService } from './qrService';
export { tenantService } from './tenantService';
export { authService } from './authService';
export { scheduleService } from './scheduleService';
export { telemetryService } from './telemetryService';
export { energyService } from './energyService';
export { petaniSubscriptionService } from './petaniSubscriptionService';

