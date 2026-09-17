import { apiClient } from './api';
import type { ApiResponse } from '@/types/api.types';
import type { TenantBackend, ToggleAdminAccessPayload } from '@/types/tenant.types';

export const tenantService = {
  toggleAdminAccess: async (isAdminAllowed: boolean): Promise<ApiResponse<TenantBackend>> => {
    const payload: ToggleAdminAccessPayload = { is_admin_allowed: isAdminAllowed };
    return await apiClient.patch<ApiResponse<TenantBackend>>('/petani/tenant/toggle-admin-access', payload);
  },
};
