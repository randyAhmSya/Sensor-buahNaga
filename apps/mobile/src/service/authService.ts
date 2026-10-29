import apiClient, { EnhancedApiError } from "./apiClient";
import { authStorage, type AuthUser } from "./authStorage";

export interface LoginResponseData {
  user: AuthUser;
  role: string;
  token: string;
}

export interface BackendLoginData {
  user?: AuthUser;
  role?: string;
  token?: string;
  access_token?: string;
}

export interface BackendLoginResponse {
  status: string;
  pesan?: string;
  data?: BackendLoginData;
  token?: string;
  access_token?: string;
  user?: AuthUser;
  role?: string;
}

/**
 * Autentikasi service untuk integrasi Laravel Sanctum.
 */
export const authService = {
  /**
   * Melakukan login dengan email dan password ke Laravel backend:
   * POST /api/auth/login
   */
  async login(email: string, password: string): Promise<LoginResponseData> {
    const trimmedEmail = email.trim();
    console.log("[authService.login] Mengirim kredensial login:", { email: trimmedEmail });

    try {
      const response = await apiClient.post<BackendLoginResponse>(
        "/auth/login",
        {
          email: trimmedEmail,
          password,
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      const resData = response.data;
      // Verifikasi token dari berbagai kemungkinan key backend Laravel
      const token =
        resData?.data?.token ||
        resData?.data?.access_token ||
        resData?.token ||
        resData?.access_token;

      if (!token) {
        if (__DEV__) {
          console.warn("[authService.login] Token tidak ditemukan dalam payload respons:", resData);
        }
        throw new Error("Token autentikasi tidak ditemukan dalam respons server.");
      }

      const user = resData?.data?.user || resData?.user || null;
      const role = resData?.data?.role || resData?.role || user?.role || "user";

      // Pastikan token dan data user benar-benar tersimpan ke persistent storage (SecureStore/LocalStorage)
      await authStorage.saveToken(token);
      if (user) {
        await authStorage.setUser(user);
      }

      console.log("[authService.login] Token berhasil disimpan di persistent storage. Role:", role);

      return {
        user: user || ({ email: trimmedEmail, role } as AuthUser),
        role,
        token,
      };
    } catch (err: unknown) {
      if (__DEV__) {
        if (err instanceof EnhancedApiError) {
          console.warn("[authService.login Warning Catch]:", {
            status: err.status,
            data: err.data,
            message: err.message,
          });
        } else if (err instanceof Error) {
          console.warn("[authService.login Warning Catch]:", err.message);
        }
      }
      throw err;
    }
  },

  /**
   * Melakukan logout ke Laravel Sanctum dan membersihkan sesi lokal:
   * POST /api/auth/logout
   */
  async logout(): Promise<void> {
    try {
      const token = await authStorage.getValidToken();
      if (token) {
        await apiClient.post("/auth/logout");
      }
    } catch (err) {
      // Abaikan error jaringan saat logout agar sesi lokal tetap bersih
      console.warn("[authService] Warning saat logout dari server:", err);
    } finally {
      await authStorage.clear();
    }
  },

  /**
   * Mengambil data user yang sedang aktif.
   */
  getUser(): AuthUser | null {
    return authStorage.getUser();
  },

  async getUserAsync(): Promise<AuthUser | null> {
    return await authStorage.getUserAsync();
  },

  /**
   * Memeriksa apakah user sudah terotentikasi.
   */
  isAuthenticated(): boolean {
    return authStorage.isAuthenticated();
  },

  async isAuthenticatedAsync(): Promise<boolean> {
    const token = await authStorage.getValidToken();
    return !!token;
  },
};

export default authService;
