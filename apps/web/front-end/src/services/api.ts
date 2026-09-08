import { MASTER_FARMS, type FarmEntity } from '@/data/centralData';
import { MOCK_ACTIVE_SCHEDULES, type ActiveScheduleItem } from '@/data/mockSchedules';
import { MOCK_HARVEST_CYCLES, type HarvestCycleItem } from '@/data/mockHarvests';
import { MOCK_QR_CODES, type QRCodeItem } from '@/data/mockQRCodes';

/**
 * Base API Client with Interceptor & Error Handling
 * Backend-Ready abstraction for REST endpoints with fallback/mock capabilities.
 */

export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
}

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

type RequestInterceptor = (config: ApiRequestOptions) => ApiRequestOptions | Promise<ApiRequestOptions>;
type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

class ApiClient {
  private baseUrl: string;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  useRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
  }

  useResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
  }

  async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    let finalOptions = { ...options };

    for (const interceptor of this.requestInterceptors) {
      finalOptions = await interceptor(finalOptions);
    }

    let url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    if (finalOptions.params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(finalOptions.params)) {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((finalOptions.headers as Record<string, string>) || {}),
    };

    const token = localStorage.getItem('agro_auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), finalOptions.timeout || 15000);

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
        throw new ApiError(
          `Request failed with status ${response.status}`,
          response.status,
          errorData
        );
      }

      return (await response.json()) as T;
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      if (error instanceof ApiError) throw error;
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError('Request timed out', 408);
      }
      throw new ApiError((error as Error)?.message || 'Network request failed', 500);
    }
  }

  get<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

// ==================== SERVICE LAYER ABSTRACTIONS ====================
// Simulasi network delay
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export const farmService = {
  getAll: async (): Promise<FarmEntity[]> => {
    await delay();
    return MASTER_FARMS;
  },
};

export const scheduleService = {
  getAll: async (): Promise<ActiveScheduleItem[]> => {
    await delay();
    return MOCK_ACTIVE_SCHEDULES;
  },
  delete: async (_id: string): Promise<boolean> => {
    await delay();
    return true;
  },
};

export const harvestService = {
  getAll: async (): Promise<HarvestCycleItem[]> => {
    await delay();
    return MOCK_HARVEST_CYCLES;
  },
};

export const qrCodeService = {
  getAll: async (): Promise<QRCodeItem[]> => {
    await delay();
    return MOCK_QR_CODES;
  },
  delete: async (_id: string): Promise<boolean> => {
    await delay();
    return true;
  },
};
