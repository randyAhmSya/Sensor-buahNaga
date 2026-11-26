import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import apiClient, { EnhancedApiError, getBaseApiUrl } from "./apiClient";
import { authStorage, type AuthUser } from "./authStorage";
import { clearAppCache } from "@/lib/queryClient";

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

/** Pesan untuk kode galat yang dikembalikan backend pada alur login Google. */
const PESAN_GOOGLE: Record<string, string> = {
  state_tidak_valid: "Sesi login Google kedaluwarsa. Silakan coba lagi.",
  gagal_google: "Tidak dapat terhubung ke Google. Silakan coba lagi.",
  email_belum_terverifikasi: "Email Google Anda belum terverifikasi.",
  superadmin_tidak_diizinkan:
    "Akun Super Admin wajib masuk dengan email dan kata sandi.",
  akun_nonaktif: "Akun ini dinonaktifkan. Hubungi admin AgroLight.",
  akun_google_berbeda: "Email ini sudah tertaut dengan akun Google yang lain.",
};

/** Dilempar saat pengguna menutup/membatalkan jendela Google; bukan kesalahan yang perlu ditampilkan. */
export class GoogleLoginDibatalkan extends Error {
  constructor() {
    super("Login Google dibatalkan.");
    this.name = "GoogleLoginDibatalkan";
  }
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
    if (__DEV__) {
      const maskedEmail = trimmedEmail.replace(/(?<=^.).*(?=@)/, "***");
      console.log("[authService.login] Mengirim kredensial login:", {
        email: maskedEmail,
      });
    }

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
          console.warn(
            "[authService.login] Token tidak ditemukan dalam payload respons:",
            resData,
          );
        }
        throw new Error(
          "Token autentikasi tidak ditemukan dalam respons server.",
        );
      }

      const user = resData?.data?.user || resData?.user || null;
      const role = resData?.data?.role || resData?.role || user?.role || "user";

      // Bersihkan cache aplikasi jika login sebagai pengguna berbeda atau login baru
      const previousUser = authStorage.getUser();
      if (
        !previousUser ||
        previousUser.id !== user?.id ||
        previousUser.email !== user?.email
      ) {
        await clearAppCache();
      }

      // Pastikan token dan data user benar-benar tersimpan ke persistent storage (SecureStore/LocalStorage)
      await authStorage.saveToken(token);
      if (user) {
        await authStorage.setUser(user);
      }

      if (__DEV__) {
        console.log(
          "[authService.login] Sesi autentikasi berhasil disimpan di persistent storage. Role:",
          role,
        );
      }

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
   * Login dengan Google lewat browser sistem (alur yang sama dengan web):
   * 1. Buka GET /api/auth/google/redirect?app_redirect=<deep link aplikasi>
   * 2. Setelah Google, backend mengembalikan ke deep link dengan ?kode=... (sekali pakai, 60 dtk)
   * 3. Kode ditukar dengan token Sanctum lewat POST /api/auth/google/tukar
   */
  async loginDenganGoogle(): Promise<LoginResponseData> {
    const returnUrl = Linking.createURL("auth/google");
    const startUrl = `${getBaseApiUrl()}/auth/google/redirect?app_redirect=${encodeURIComponent(returnUrl)}`;

    const hasil = await WebBrowser.openAuthSessionAsync(startUrl, returnUrl);
    if (hasil.type !== "success") {
      throw new GoogleLoginDibatalkan();
    }

    const params = Linking.parse(hasil.url).queryParams ?? {};
    const galat =
      typeof params.google_error === "string" ? params.google_error : null;
    if (galat) {
      if (galat === "dibatalkan") throw new GoogleLoginDibatalkan();
      throw new Error(
        PESAN_GOOGLE[galat] || "Login Google gagal. Silakan coba lagi.",
      );
    }

    const kode = typeof params.kode === "string" ? params.kode : null;
    if (!kode) {
      throw new Error("Login Google gagal. Silakan coba lagi.");
    }

    const response = await apiClient.post<BackendLoginResponse>(
      "/auth/google/tukar",
      { kode },
    );
    const data = response.data?.data;
    const token = data?.token;
    const user = data?.user;
    if (!token || !user) {
      throw new Error("Respons login Google tidak lengkap.");
    }

    const previousUser = authStorage.getUser();
    if (!previousUser || previousUser.id !== user.id) {
      await clearAppCache();
    }
    await authStorage.saveToken(token);
    await authStorage.setUser(user);

    return { user, role: data?.role || user.role, token };
  },

  /**
   * Melengkapi profil akun baru hasil login Google:
   * POST /api/auth/lengkapi-profil
   */
  async lengkapiProfil(
    namaTenant: string,
    nomorTelepon: string,
  ): Promise<AuthUser> {
    const response = await apiClient.post<{ data?: AuthUser }>(
      "/auth/lengkapi-profil",
      {
        nama_tenant: namaTenant.trim(),
        nomor_telepon: nomorTelepon.replace(/[\s-]/g, ""),
      },
    );

    const lama = authStorage.getUser();
    const baru = {
      ...(lama as AuthUser),
      ...(response.data?.data ?? {}),
      profil_lengkap: true,
    } as AuthUser;
    await authStorage.setUser(baru);
    return baru;
  },

  /**
   * Melakukan logout ke Laravel Sanctum dan membersihkan sesi lokal serta cache aplikasi:
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
      await clearAppCache();
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
