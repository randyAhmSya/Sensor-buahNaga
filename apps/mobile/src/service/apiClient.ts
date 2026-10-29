import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { authStorage } from "./authStorage";

export type SubscriptionRequiredListener = (message: string) => void;
const subscriptionListeners = new Set<SubscriptionRequiredListener>();

export class EnhancedApiError extends Error {
  status?: number;
  response?: unknown;
  data?: unknown;
  isPaymentRequired?: boolean;
  originalError?: unknown;

  constructor(message: string) {
    super(message);
    this.name = "EnhancedApiError";
  }
}

/**
 * Mendaftarkan callback saat backend mengembalikan 402 Payment Required (langganan habis/nonaktif).
 */
export function onSubscriptionRequired(listener: SubscriptionRequiredListener): () => void {
  subscriptionListeners.add(listener);
  return () => {
    subscriptionListeners.delete(listener);
  };
}

export function notifySubscriptionRequired(message: string): void {
  subscriptionListeners.forEach((listener) => {
    try {
      listener(message);
    } catch (e) {
      console.warn("[apiClient] Error inside subscriptionRequired listener:", e);
    }
  });
}

export function getBaseApiUrl(): string {
  // 1. Prioritas Utama: EXPO_PUBLIC_API_URL dari .env atau Constants.expoConfig?.extra?.apiUrl
  const envApiUrl =
    process.env.EXPO_PUBLIC_API_URL ||
    (Constants.expoConfig?.extra?.apiUrl as string | undefined);

  if (envApiUrl && envApiUrl.trim().length > 0) {
    const trimmed = envApiUrl.trim();
    return trimmed.endsWith("/api") ? trimmed : `${trimmed.replace(/\/+$/, "")}/api`;
  }

  // 2. Deteksi otomatis dari host Metro Bundler (physical device via Expo Go)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const hostIp = hostUri.split(":")[0];
    if (hostIp && hostIp !== "localhost" && hostIp !== "127.0.0.1") {
      return `http://${hostIp}:8000/api`;
    }
  }

  // 3. Fallback cerdas: Android Emulator (10.0.2.2) vs Web / iOS Simulator (localhost)
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000/api";
  }

  return "http://localhost:8000/api";
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseApiUrl(),
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Request Interceptor: selalu baca token dari authStorage kecuali endpoint login/register
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const isAuthEndpoint =
        config.url?.includes("/auth/login") ||
        config.url?.includes("/auth/register");

      if (!isAuthEndpoint) {
        const token = await authStorage.getToken();
        if (token) {
          config.headers.set("Authorization", `Bearer ${token}`);
        }
      }

      if (__DEV__) {
        console.log(
          "[apiClient Request]:",
          config.method?.toUpperCase(),
          config.url,
          "BaseURL:",
          config.baseURL || apiClient.defaults.baseURL,
        );
      }
    } catch (err) {
      if (__DEV__) {
        console.warn("[apiClient Request Interceptor] Gagal menyematkan token auth:", err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: tangani pesan error spesifik backend
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ status?: string; pesan?: string; message?: string; errors?: Record<string, string[]> }>) => {
    // Log detail error response backend untuk debugging di console/terminal (menggunakan warn agar tidak memicu RedBox)
    if (__DEV__) {
      console.warn("[apiClient Response Warning]:", {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }

    let customMessage = "Terjadi kesalahan pada server.";

    if (error.response?.data) {
      const data = error.response.data;
      if (data.pesan) {
        customMessage = data.pesan;
      } else if (data.message) {
        customMessage = data.message;
      } else if (data.errors) {
        const firstErrorKey = Object.keys(data.errors)[0];
        const firstError = data.errors[firstErrorKey]?.[0];
        if (firstError) {
          customMessage = firstError;
        }
      }
    } else if (error.message) {
      if (error.message.includes("Network Error")) {
        customMessage = `Tidak dapat terhubung ke server backend (${apiClient.defaults.baseURL}). Pastikan backend Laravel sedang berjalan (php artisan serve).`;
      } else {
        customMessage = error.message;
      }
    }

    // Jika 401 Unauthenticated di luar endpoint login, hapus token kadaluarsa
    if (error.response?.status === 401 && !error.config?.url?.includes("/auth/login")) {
      console.warn("[apiClient] 401 Unauthenticated terdeteksi pada", error.config?.url, "- membersihkan sesi lokal.");
      authStorage.clear().catch((e) => console.warn("[apiClient] Gagal membersihkan authStorage:", e));
    }

    // Jika 402 Payment Required (langganan kadaluarsa / nonaktif)
    if (error.response?.status === 402) {
      console.warn("[apiClient] 402 Payment Required terdeteksi pada", error.config?.url);
      notifySubscriptionRequired(customMessage);
    }

    // Bungkus ke Error object dengan pesan yang ramah pengguna
    const enhancedError = new EnhancedApiError(customMessage);
    enhancedError.status = error.response?.status;
    enhancedError.response = error.response;
    enhancedError.data = error.response?.data;
    enhancedError.isPaymentRequired = error.response?.status === 402;
    enhancedError.originalError = error;

    return Promise.reject(enhancedError);
  },
);

export default apiClient;
