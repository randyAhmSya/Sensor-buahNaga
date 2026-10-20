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

const getInitialAuthState = (): { user: UserProfile | null; token: string | null; isAuthenticated: boolean } => {
  if (typeof window === 'undefined') {
    return { user: null, token: null, isAuthenticated: false };
  }

  try {
    const savedToken = localStorage.getItem('agro_auth_token');
    const savedUserStr = localStorage.getItem('agro_auth_user');

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

export const useAuthStore = create<AuthState>((set) => ({
  user: initialState.user,
  token: initialState.token,
  isAuthenticated: initialState.isAuthenticated,

  login: (user: UserProfile, token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('agro_auth_token', token);
      localStorage.setItem('agro_auth_user', JSON.stringify(user));
    }
    set({
      user,
      token,
      isAuthenticated: true,
    });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('agro_auth_token');
      localStorage.removeItem('agro_auth_user');
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },
}));
