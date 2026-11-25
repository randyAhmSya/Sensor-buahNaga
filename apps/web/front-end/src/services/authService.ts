import { apiClient } from "./api";
import type { ApiResponse } from "@/types/api.types";
import type {
  BackendUser,
  LoginPayload,
  LoginResponseData,
  RegisterPayload,
  RegisterResponseData,
} from "@/types/auth.types";

export const authService = {
  login: async (
    payload: LoginPayload,
  ): Promise<ApiResponse<LoginResponseData>> => {
    return await apiClient.post<ApiResponse<LoginResponseData>>(
      "/auth/login",
      payload,
    );
  },

  register: async (
    payload: RegisterPayload,
  ): Promise<ApiResponse<RegisterResponseData>> => {
    return await apiClient.post<ApiResponse<RegisterResponseData>>(
      "/auth/register",
      payload,
    );
  },

  /** Tukar kode satu kali pakai dari redirect Google dengan token Sanctum. */
  googleTukar: async (
    kode: string,
  ): Promise<ApiResponse<LoginResponseData>> => {
    return await apiClient.post<ApiResponse<LoginResponseData>>(
      "/auth/google/tukar",
      { kode },
    );
  },

  lengkapiProfil: async (payload: {
    nama_tenant: string;
    nomor_telepon: string;
  }): Promise<ApiResponse<BackendUser>> => {
    return await apiClient.post<ApiResponse<BackendUser>>(
      "/auth/lengkapi-profil",
      payload,
    );
  },

  /** Alamat awal alur login Google (browser harus berpindah halaman, bukan fetch). */
  googleRedirectUrl: (): string => {
    const base =
      (import.meta.env?.VITE_API_BASE_URL as string | undefined) ||
      "http://localhost:8000/api";
    return `${base.replace(/\/+$/, "")}/auth/google/redirect`;
  },

  logout: async (): Promise<ApiResponse<null>> => {
    return await apiClient.post<ApiResponse<null>>("/auth/logout");
  },
};
