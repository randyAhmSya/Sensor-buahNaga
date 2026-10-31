export const QUERY_KEYS = {
  kebun: {
    all: ['kebuns'] as const,
    list: () => ['kebuns', 'list'] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
    blokLampu: (blokId: string) => ['dashboard', 'blokLampu', blokId] as const,
  },
  monitoring: {
    all: ['monitoring'] as const,
    list: (filters?: Record<string, unknown>) =>
      ['monitoring', 'list', filters] as const,
  },
  nodes: {
    all: ['nodes'] as const,
    detail: (id: string) => ['nodes', id] as const,
  },
  nodeRingkasan: (id: string) => ['node-ringkasan', id] as const,
  jadwalLampu: {
    all: ['jadwalLampu'] as const,
    aktif: (sensorId?: string) => ['jadwalLampu', 'aktif', sensorId] as const,
  },
  harvest: {
    all: ['harvest'] as const,
    list: (blokId?: string) => ['harvest', 'list', blokId] as const,
    detail: (id?: string) => ['harvest', 'detail', id] as const,
  },
  profile: {
    all: ['profile'] as const,
  },
  accountSettings: {
    all: ['accountSettings'] as const,
  },
  notificationSettings: {
    all: ['notificationSettings'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (filters?: Record<string, unknown>) =>
      ['notifications', 'list', filters] as const,
    unreadCount: ['notifications', 'unreadCount'] as const,
  },
  qr: {
    logs: ['qr', 'logs'] as const,
  },
  subscription: {
    all: ['subscription'] as const,
    packages: () => ['subscription', 'packages'] as const,
    status: () => ['subscription', 'status'] as const,
    history: (filters?: Record<string, unknown>) =>
      ['subscription', 'history', filters] as const,
  },
} as const;
