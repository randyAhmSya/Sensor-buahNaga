import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";

export interface AuthUser {
  id: string;
  tenant_id?: string | null;
  nama_lengkap: string;
  email: string;
  role: string;
  is_aktif: boolean;
  phone?: string;
  location?: string;
  avatarUrl?: string;
}

export type AuthState = {
  isInitialized: boolean;
  isAuthenticated: boolean;
  token: string | null;
  user: AuthUser | null;
};

const STORAGE_KEY_TOKEN = "agrolight_auth_token";
const STORAGE_KEY_USER = "agrolight_auth_user";

let inMemoryToken: string | null = null;
let inMemoryUser: AuthUser | null = null;
let isInitialized = false;
let initPromise: Promise<void> | null = null;

type AuthListener = (state: AuthState) => void;
const authListeners = new Set<AuthListener>();

function notifyAuthListeners(): void {
  const state: AuthState = {
    isInitialized,
    isAuthenticated: !!inMemoryToken,
    token: inMemoryToken,
    user: inMemoryUser,
  };
  authListeners.forEach((listener) => {
    try {
      listener(state);
    } catch (err) {
      console.warn("[authStorage] Error pada auth listener:", err);
    }
  });
}

export function onAuthStateChanged(listener: AuthListener): () => void {
  authListeners.add(listener);
  listener({
    isInitialized,
    isAuthenticated: !!inMemoryToken,
    token: inMemoryToken,
    user: inMemoryUser,
  });
  return () => {
    authListeners.delete(listener);
  };
}

export function useAuthState(): AuthState {
  const [state, setState] = useState<AuthState>(() => ({
    isInitialized,
    isAuthenticated: !!inMemoryToken,
    token: inMemoryToken,
    user: inMemoryUser,
  }));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  return state;
}

export const authStorage = {
  /**
   * Menginisialisasi token & user dari secure storage saat app start.
   */
  async init(): Promise<void> {
    if (!initPromise) {
      initPromise = (async () => {
        try {
          const storedToken = await storage.getItem(STORAGE_KEY_TOKEN);
          const storedUserStr = await storage.getItem(STORAGE_KEY_USER);

          if (storedToken) {
            inMemoryToken = storedToken;
          }
          if (storedUserStr) {
            try {
              inMemoryUser = JSON.parse(storedUserStr);
            } catch {
              inMemoryUser = null;
            }
          }
        } catch (err) {
          console.warn("[authStorage] Gagal menginisialisasi dari storage:", err);
        } finally {
          isInitialized = true;
          notifyAuthListeners();
        }
      })();
    }
    return initPromise;
  },

  isInitialized(): boolean {
    return isInitialized;
  },

  /**
   * Mengambil token secara asinkron.
   * Prioritas:
   * 1. inMemoryToken (langsung return jika sudah tersedia)
   * 2. Menunggu initPromise jika sedang berjalan
   * 3. storage.getItem(STORAGE_KEY_TOKEN) (persistent fallback)
   */
  async getToken(): Promise<string | null> {
    if (inMemoryToken) {
      return inMemoryToken;
    }

    if (initPromise) {
      await initPromise;
      if (inMemoryToken) return inMemoryToken;
    }

    try {
      const storedToken = await storage.getItem(STORAGE_KEY_TOKEN);
      if (storedToken) {
        inMemoryToken = storedToken;
        notifyAuthListeners();
        return storedToken;
      }
    } catch (err) {
      console.warn("[authStorage] Gagal mengambil token langsung dari storage:", err);
    }

    return null;
  },

  /**
   * Alias untuk getToken.
   */
  async getAuthToken(): Promise<string | null> {
    return this.getToken();
  },

  /**
   * Alias untuk getToken.
   */
  async getValidToken(): Promise<string | null> {
    return this.getToken();
  },

  /**
   * Mengambil token secara sinkron untuk pengecekan cepat di runtime.
   */
  getTokenSync(): string | null {
    return inMemoryToken;
  },

  /**
   * Menyimpan token secara persisten dan mengupdate in-memory cache secara instan.
   */
  async saveToken(token: string | null): Promise<void> {
    inMemoryToken = token;
    notifyAuthListeners();
    try {
      if (token) {
        await storage.setItem(STORAGE_KEY_TOKEN, token);
      } else {
        await storage.removeItem(STORAGE_KEY_TOKEN);
      }
    } catch (err) {
      console.warn("[authStorage.saveToken] Gagal menyimpan ke storage:", err);
    }
  },

  /**
   * Alias untuk saveToken agar backward-compatible.
   */
  async setToken(token: string | null): Promise<void> {
    return this.saveToken(token);
  },

  getUser(): AuthUser | null {
    return inMemoryUser;
  },

  async getUserAsync(): Promise<AuthUser | null> {
    if (inMemoryUser) return inMemoryUser;
    await this.init();
    return inMemoryUser;
  },

  async setUser(user: AuthUser | null): Promise<void> {
    inMemoryUser = user;
    notifyAuthListeners();
    if (user) {
      await storage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      await storage.removeItem(STORAGE_KEY_USER);
    }
  },

  async saveUser(user: AuthUser | null): Promise<void> {
    return this.setUser(user);
  },

  async clear(): Promise<void> {
    inMemoryToken = null;
    inMemoryUser = null;
    notifyAuthListeners();
    await storage.removeItem(STORAGE_KEY_TOKEN);
    await storage.removeItem(STORAGE_KEY_USER);
  },

  isAuthenticated(): boolean {
    return !!inMemoryToken;
  },
};

// Panggil inisialisasi awal di background saat modul dimuat
authStorage.init();

export default authStorage;
