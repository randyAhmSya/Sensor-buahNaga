import { apiClient } from './api';
import type { ApiResponse } from '@/types/api.types';
import type { PetaniDashboardData } from '@/types/dashboard.types';

export const dashboardService = {
  getPetaniDashboard: async (kebunId: string): Promise<PetaniDashboardData> => {
    const cleanId = (kebunId || '').trim();
    if (!cleanId) {
      throw new Error('Parameter kebun_id wajib disertakan.');
    }

    const response = await apiClient.get<ApiResponse<PetaniDashboardData>>('/petani/dashboard', {
      params: { kebun_id: cleanId },
    });

    if (!response || !response.data) {
      throw new Error('Data dashboard tidak ditemukan atau respons kosong.');
    }

    return response.data;
  },
};

