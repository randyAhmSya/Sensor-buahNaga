import { apiClient } from './api';
import type { ApiResponse } from '@/types/api.types';
import type {
  LoginPayload,
  LoginResponseData,
  RegisterPayload,
  RegisterResponseData,
} from '@/types/auth.types';

export const authService = {
  login: async (payload: LoginPayload): Promise<ApiResponse<LoginResponseData>> => {
    return await apiClient.post<ApiResponse<LoginResponseData>>('/auth/login', payload);
  },

  register: async (payload: RegisterPayload): Promise<ApiResponse<RegisterResponseData>> => {
    return await apiClient.post<ApiResponse<RegisterResponseData>>('/auth/register', payload);
  },

  logout: async (): Promise<ApiResponse<null>> => {
    return await apiClient.post<ApiResponse<null>>('/auth/logout');
  },
};