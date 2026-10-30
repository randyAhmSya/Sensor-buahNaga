import { create } from 'zustand';
import type { UserProfile, AuthState } from '../types';
import { USER_ROLES, type UserRole } from '../config/constants';
import type { BackendUser } from '../types/auth.types';

export const mapRoleToUserRole = (backendRole?: string | null): UserRole => {
  if (!backendRole) return USER_ROLES.ADMIN_KEBUN;
  const normalized = backendRole.toLowerCase().replace(/[-_\s]/g, '');
  if (normalized === 'superadmin') {
    return USER_ROLES.SUPER_ADMIN;
  }
  if (normalized === 'petani') {
    return USER_ROLES.PETANI;
  }
  if (normalized === 'agronom') {
    return USER_ROLES.AGRONOM;
  }
  return USER_ROLES.ADMIN_KEBUN;
};

export const getRoleLabel = (role?: string | null): string => {
  if (!role) return 'Pengguna';
  const normalized = role.toLowerCase().replace(/[-_\s]/g, '');
  if (normalized === 'superadmin') return 'Super Admin';
  if (normalized === 'adminkebun') return 'Admin Kebun';
  if (normalized === 'petani') return 'Petani';
  if (normalized === 'agronom') return 'Agronom';
  return role;
};

export const mapBackendUserToUserProfile = (user: BackendUser): UserProfile => {
  return {
    id: user.id,
    name: user.nama_lengkap,
    email: user.email,
    role: mapRoleToUserRole(user.role),
    tenantId: user.tenant_id,
    avatarUrl: user.url_foto || undefined,
  };
};

export const AUTH_STORAGE_KEYS = {
  TOKEN: 'agro_auth_token',
  USER: 'agro_auth_user',
} as const;

const getInitialAuthState = (): { user: UserProfile | null; token: string | null; isAuthenticated: boolean } => {
  if (typeof window === 'undefined') {
    return { user: null, token: null, isAuthenticated: false };
  }

  try {
    const savedToken = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
    const savedUserStr = localStorage.getItem(AUTH_STORAGE_KEYS.USER);

    if (savedToken && savedUserStr) {
      const parsedUser = JSON.parse(savedUserStr) as UserProfile;
      return {
        user: parsedUser,
        token: savedToken,
        isAuthenticated: true,
      };
    }
  } catch {
    // ignore json error
  }

  return {
    user: null,
    token: null,
    isAuthenticated: false,
  };
};

const initialState = getInitialAuthState();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialState.user,
  token: initialState.token,
  isAuthenticated: initialState.isAuthenticated,
  isCheckingSession: false,

  login: (user: UserProfile, token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
    }
    set({
      user,
      token,
      isAuthenticated: true,
      isCheckingSession: false,
    });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
      localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
      sessionStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
      sessionStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isCheckingSession: false,
    });
  },

  validateSession: async (): Promise<boolean> => {
    const currentToken = get().token || (typeof window !== 'undefined' ? localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN) : null);
    if (!currentToken) {
      get().logout();
      return false;
    }

    set({ isCheckingSession: true });
    try {
      const { apiClient } = await import('@/services/api');
      const response = await apiClient.get<{ status: string; data: BackendUser }>('/auth/me');
      if (response && response.data) {
        const profile = mapBackendUserToUserProfile(response.data);
        if (typeof window !== 'undefined') {
          localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(profile));
        }
        set({
          user: profile,
          token: currentToken,
          isAuthenticated: true,
          isCheckingSession: false,
        });
        return true;
      }
      return false;
    } catch {
      // Jika 401, interceptor di api.ts sudah memanggil handleUnauthorizedSession()
      // Jika error offline / server down, biarkan data lokal tanpa logout paksa
      set({ isCheckingSession: false });
      return false;
    }
  },
}));
