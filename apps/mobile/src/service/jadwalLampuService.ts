import apiClient from "./apiClient";
import type {
  JadwalLampuAktif,
  JadwalLampuResponse,
  UpdateJadwalManualPayload,
  CreateJadwalOverridePayload,
  JadwalErrorDetails,
} from "@/types/jadwalLampu";

/**
 * Memformat string waktu jam menjadi format HH:mm (memotong komponen detik jika ada).
 * Contoh: "18:00:00" -> "18:00"
 */
export function formatTimeToHHmm(timeStr: string): string {
  if (!timeStr) return "";
  const parts = timeStr.trim().split(":");
  if (parts.length >= 2) {
    const hh = parts[0].padStart(2, "0");
    const mm = parts[1].padStart(2, "0");
    return `${hh}:${mm}`;
  }
  return timeStr.trim();
}

/**
 * Mengambil jadwal lampu aktif untuk node sensor tertentu.
 * Endpoint: GET /api/petani/jadwal-lampu/aktif?sensor_id={sensorId}
 */
export async function getJadwalLampuAktif(
  sensorId: string,
): Promise<JadwalLampuAktif | null> {
  const trimmed = sensorId.trim();
  if (!trimmed) return null;

  const response = await apiClient.get<JadwalLampuResponse<JadwalLampuAktif>>(
    "/petani/jadwal-lampu/aktif",
    {
      params: { sensor_id: trimmed },
    },
  );

  return response.data?.data ?? null;
}

/**
 * Kasus A: Memperbarui jadwal yang sudah eksklusif milik sensor ini ke mode manual.
 * Endpoint: PUT /api/petani/jadwal-lampu/{id_jadwal_lampu}
 */
export async function updateJadwalManual(
  idJadwalLampu: string,
  payload: UpdateJadwalManualPayload,
): Promise<JadwalLampuAktif> {
  const response = await apiClient.put<JadwalLampuResponse<JadwalLampuAktif>>(
    `/petani/jadwal-lampu/${encodeURIComponent(idJadwalLampu)}`,
    payload,
  );

  return response.data.data;
}

/**
 * Kasus B: Membuat jadwal override manual khusus sensor ini (sebelumnya mengikuti kebun).
 * Endpoint: POST /api/petani/jadwal-lampu
 */
export async function createJadwalOverride(
  payload: CreateJadwalOverridePayload,
): Promise<JadwalLampuAktif> {
  const cleanPayload: CreateJadwalOverridePayload = {
    sensor_id: payload.sensor_id,
    jam_mulai_nyala: formatTimeToHHmm(payload.jam_mulai_nyala),
    jam_akhir_nyala: formatTimeToHHmm(payload.jam_akhir_nyala),
    mode: "manual",
    instensitas_cahaya: payload.instensitas_cahaya,
  };

  const response = await apiClient.post<JadwalLampuResponse<JadwalLampuAktif>>(
    "/petani/jadwal-lampu",
    cleanPayload,
  );

  return response.data.data;
}

interface AxiosErrorLike {
  message?: string;
  status?: number;
  response?: {
    status?: number;
    headers?: Record<string, unknown>;
    data?: {
      status?: string;
      pesan?: string;
      message?: string;
      errors?: Record<string, string[]>;
    };
  };
}

/**
 * Mem-parse error dari eksekusi mutasi jadwal lampu agar menghasilkan pesan ramah pengguna
 * dan durasi cooldown detik (khusus HTTP 429).
 */
export function parseJadwalError(error: unknown): JadwalErrorDetails {
  const err = error as AxiosErrorLike;
  const status = err.status ?? err.response?.status;
  const responseData = err.response?.data;

  let message =
    responseData?.pesan ||
    responseData?.message ||
    err.message ||
    "Terjadi kesalahan saat memproses jadwal lampu.";

  // Status-specific fallback messages
  if (status === 403) {
    message = "Anda tidak punya akses ke blok ini.";
  } else if (status === 404) {
    message = "Jadwal tidak ditemukan.";
  } else if (status === 422 && responseData?.errors) {
    const firstKey = Object.keys(responseData.errors)[0];
    const firstErr = responseData.errors[firstKey]?.[0];
    if (firstErr) {
      message = firstErr;
    }
  }

  let retryAfterSeconds: number | undefined = undefined;

  if (status === 429) {
    const headers = err.response?.headers;
    const retryHeader =
      headers?.["retry-after"] ?? headers?.["Retry-After"];

    if (retryHeader !== undefined && retryHeader !== null) {
      const parsed = parseInt(String(retryHeader), 10);
      if (!isNaN(parsed) && parsed > 0) {
        retryAfterSeconds = parsed;
      }
    }

    // Fallback ekstraksi regex jika header tidak terbaca
    if (!retryAfterSeconds) {
      const match = message.match(/(\d+)\s*detik/i);
      if (match?.[1]) {
        const parsed = parseInt(match[1], 10);
        if (!isNaN(parsed) && parsed > 0) {
          retryAfterSeconds = parsed;
        }
      } else {
        retryAfterSeconds = 7; // Default durasi cooldown server
      }
    }
  }

  return {
    message,
    status,
    retryAfterSeconds,
  };
}
