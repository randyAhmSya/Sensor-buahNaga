import apiClient from "./apiClient";
import { Platform } from "react-native";
import type { BackendSensorDTO } from "@/types/api";
import { scanHistoryStorage } from "./storage/scanHistoryStorage";

export interface ScanQrPayload {
  teks_kode_qr: string;
  platform?: "android" | "ios";
  latitude?: number;
  longitude?: number;
}

export interface ScanQrResponse {
  status: string;
  pesan: string;
  data: BackendSensorDTO;
}

export interface QrScanLogItem {
  id_scan_log: string;
  qr_id?: string | null;
  user_id?: string | null;
  nama_user_saat_scan?: string | null;
  status_scan: string; // "berhasil" | "gagal" | "ditolak_..."
  platform?: string | null;
  ip_address?: string | null;
  dicatat_pada: string;
  teks_kode_qr?: string;
  kode_perangkat?: string;
  kode_qr?: {
    id_qr?: string;
    teks_kode_qr?: string;
    node_sensor?: {
      id_sensor?: string;
      kode_perangkat?: string;
    };
  };
}

/**
 * Mengirim request scan QR code ke backend AgroLight:
 * POST /api/petani/qr/scan
 * Body: { teks_kode_qr: string, platform: 'android' | 'ios' }
 */
export async function submitScanQr(
  teksKodeQr: string,
  meta?: { latitude?: number; longitude?: number },
): Promise<ScanQrResponse> {
  const platform = Platform.OS === "ios" ? "ios" : "android";

  const payload: ScanQrPayload = {
    teks_kode_qr: teksKodeQr.trim(),
    platform,
    ...meta,
  };

  try {
    const response = await apiClient.post<ScanQrResponse>(
      "/petani/qr/scan",
      payload,
    );

    // Catat log sukses ke local storage history
    await scanHistoryStorage.addLog({
      teks_kode_qr: teksKodeQr.trim(),
      kode_perangkat: response.data.data?.kode_perangkat,
      id_sensor: response.data.data?.id_sensor,
      status_scan: "berhasil",
      platform,
    });

    return response.data;
  } catch (error: unknown) {
    // Catat log gagal ke local storage history
    await scanHistoryStorage.addLog({
      teks_kode_qr: teksKodeQr.trim(),
      status_scan: "gagal",
      platform,
    });

    throw error;
  }
}

/**
 * Mengambil daftar riwayat scan QR dari backend AgroLight (GET /petani/qr/logs),
 * dan melakukan graceful fallback/merge dengan riwayat scan lokal.
 */
export async function fetchQrScanLogs(): Promise<QrScanLogItem[]> {
  const localRecords = await scanHistoryStorage.getLogs();

  try {
    const res = await apiClient.get<{
      status: string;
      data: QrScanLogItem[];
    }>("/petani/qr/logs");

    const backendLogs: QrScanLogItem[] = res.data?.data || [];

    if (backendLogs.length === 0 && localRecords.length > 0) {
      return localRecords.map((r) => ({
        id_scan_log: r.id_scan_log,
        status_scan: r.status_scan,
        platform: r.platform,
        dicatat_pada: r.dicatat_pada,
        teks_kode_qr: r.teks_kode_qr,
        kode_perangkat: r.kode_perangkat,
        kode_qr: {
          teks_kode_qr: r.teks_kode_qr,
          node_sensor: {
            id_sensor: r.id_sensor,
            kode_perangkat: r.kode_perangkat,
          },
        },
      }));
    }

    // Normalisasi log backend: tambahkan teks_kode_qr dan kode_perangkat jika di relasi
    const normalizedBackendLogs: QrScanLogItem[] = backendLogs.map((log) => {
      const qrText =
        log.teks_kode_qr ||
        log.kode_qr?.teks_kode_qr ||
        "QR Node";
      const nodeCode =
        log.kode_perangkat ||
        log.kode_qr?.node_sensor?.kode_perangkat ||
        undefined;

      return {
        ...log,
        teks_kode_qr: qrText,
        kode_perangkat: nodeCode,
      };
    });

    return normalizedBackendLogs;
  } catch {
    // Jika backend offline atau error, tampilkan log tersimpan di device
    return localRecords.map((r) => ({
      id_scan_log: r.id_scan_log,
      status_scan: r.status_scan,
      platform: r.platform,
      dicatat_pada: r.dicatat_pada,
      teks_kode_qr: r.teks_kode_qr,
      kode_perangkat: r.kode_perangkat,
      kode_qr: {
        teks_kode_qr: r.teks_kode_qr,
        node_sensor: {
          id_sensor: r.id_sensor,
          kode_perangkat: r.kode_perangkat,
        },
      },
    }));
  }
}

