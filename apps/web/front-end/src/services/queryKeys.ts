/**
 * Query Key Factory untuk TanStack Query v5
 * Mengikuti pedoman di 04-tanstack-query.md
 */

export const farmKeys = {
  all: ['farms'] as const,
  lists: () => [...farmKeys.all, 'list'] as const,
  details: () => [...farmKeys.all, 'detail'] as const,
  detail: (id: string) => [...farmKeys.details(), id] as const,
};

export const blockKeys = {
  all: ['blocks'] as const,
  lists: () => [...blockKeys.all, 'list'] as const,
  list: (kebunId: string) => [...blockKeys.lists(), { kebunId }] as const,
  details: () => [...blockKeys.all, 'detail'] as const,
  detail: (id: string) => [...blockKeys.details(), id] as const,
  statusLampu: (id: string) => [...blockKeys.details(), id, 'status-lampu'] as const,
};

export const sensorKeys = {
  all: ['sensors'] as const,
  lists: () => [...sensorKeys.all, 'list'] as const,
  list: (kebunId?: string) => [...sensorKeys.lists(), { kebunId: kebunId || 'all' }] as const,
  details: () => [...sensorKeys.all, 'detail'] as const,
  detail: (id: string) => [...sensorKeys.details(), id] as const,
  summary: (kebunId?: string) => [...sensorKeys.all, 'summary', { kebunId }] as const,
};

export const gatewayKeys = {
  all: ['gateways'] as const,
  lists: () => [...gatewayKeys.all, 'list'] as const,
  list: (kebunId?: string) => [...gatewayKeys.lists(), { kebunId: kebunId || '' }] as const,
  details: () => [...gatewayKeys.all, 'detail'] as const,
  detail: (id: string) => [...gatewayKeys.details(), id] as const,
};

export const harvestKeys = {
  all: ['harvests'] as const,
  lists: () => [...harvestKeys.all, 'list'] as const,
  list: (blokId: string) => [...harvestKeys.lists(), { blokId }] as const,
  details: () => [...harvestKeys.all, 'detail'] as const,
  detail: (id: string) => [...harvestKeys.details(), id] as const,
};

export const scheduleKeys = {
  all: ['schedules'] as const,
  lists: () => [...scheduleKeys.all, 'list'] as const,
  list: (params: { kebun_id?: string; sensor_id?: string }) => [...scheduleKeys.lists(), params] as const,
  details: () => [...scheduleKeys.all, 'detail'] as const,
  detail: (id: string) => [...scheduleKeys.details(), id] as const,
  active: (sensorId: string) => [...scheduleKeys.all, 'active', sensorId] as const,
};

export const telemetryKeys = {
  all: ['telemetry'] as const,
  latest: (sensorId: string) => [...telemetryKeys.all, 'latest', sensorId] as const,
  history: (sensorId: string, limit?: number) => [...telemetryKeys.all, 'history', sensorId, { limit: limit || 100 }] as const,
};

export const energyKeys = {
  all: ['energy'] as const,
  summary: (sensorId: string) => [...energyKeys.all, 'summary', sensorId] as const,
  logs: (sensorId: string) => [...energyKeys.all, 'logs', sensorId] as const,
};

export const nodeKeys = {
  all: ['nodes'] as const,
  byKebun: (kebunId: string) => [...nodeKeys.all, 'byKebun', kebunId] as const,
  detail: (id: string) => [...nodeKeys.all, 'detail', id] as const,
};

export const tenantKeys = {
  all: ['tenant'] as const,
  subscription: () => [...tenantKeys.all, 'subscription'] as const,
  packages: () => [...tenantKeys.all, 'packages'] as const,
  aksesRequests: () => [...tenantKeys.all, 'aksesRequests'] as const,
};

export const petaniSubscriptionKeys = {
  all: ['petani-subscription'] as const,
  status: () => [...petaniSubscriptionKeys.all, 'status'] as const,
  packages: () => [...petaniSubscriptionKeys.all, 'packages'] as const,
  riwayat: (page: number) => [...petaniSubscriptionKeys.all, 'riwayat', page] as const,
};

export const qrKeys = {
  all: ['qrcodes'] as const,
  logs: () => [...qrKeys.all, 'logs'] as const,
  detail: (id: string) => [...qrKeys.all, 'detail', id] as const,
};

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters?: { belum_dibaca?: boolean }) => [...notificationKeys.lists(), filters || {}] as const,
};

export const queryKeys = {
  admin: {
    dashboard: ['admin', 'dashboard'] as const,
    tenants: (page: number) => ['admin', 'tenants', page] as const,
    transaksi: (status: string, page: number) => ['admin', 'transaksi', status, page] as const,
    logs: (page: number) => ['admin', 'logs', page] as const,
    aksesRiwayat: () => ['admin', 'akses-tenant', 'riwayat'] as const,
  },
  notifications: notificationKeys,
  node: nodeKeys,
  tenant: tenantKeys,
};

