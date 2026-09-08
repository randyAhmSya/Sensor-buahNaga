import { create } from 'zustand'
import type { UserProfile, AuthState } from '../types'
import { ROLE_ADMIN } from '../config/constants'

// Initial mock user untuk kemudahan pengujian pengembangan MVP
const defaultMockUser: UserProfile = {
  id: 'USR-BWI-001',
  name: 'Bambang Sutrisno',
  email: 'bambang.s@agronaga.id',
  role: ROLE_ADMIN,
  tenantId: 'TNT-AGR-0091',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
}

export const useAuthStore = create<AuthState>((set) => ({
  user: defaultMockUser,
  token: 'mock-jwt-token-agrolight-2026',
  isAuthenticated: true,

  login: (user: UserProfile, token: string) =>
    set({
      user,
      token,
      isAuthenticated: true,
    }),

  logout: () =>
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    }),
}))
