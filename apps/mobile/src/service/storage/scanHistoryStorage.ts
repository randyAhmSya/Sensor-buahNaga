import { storage } from "@/lib/storage";

export interface ScanHistoryRecord {
  id_scan_log: string;
  teks_kode_qr: string;
  kode_perangkat?: string;
  id_sensor?: string;
  status_scan: "berhasil" | "gagal";
  platform: "android" | "ios" | string;
  dicatat_pada: string;
}

const STORAGE_KEY = "agrolight_scan_history_logs_v1";

let inMemoryLogs: ScanHistoryRecord[] = [];
let isLoaded = false;

async function loadFromDisk(): Promise<void> {
  if (isLoaded) return;
  try {
    const raw = await storage.getItem(STORAGE_KEY);
    if (raw) {
      inMemoryLogs = JSON.parse(raw);
    }
  } catch {
    inMemoryLogs = [];
  } finally {
    isLoaded = true;
  }
}

export const scanHistoryStorage = {
  async getLogs(): Promise<ScanHistoryRecord[]> {
    await loadFromDisk();
    return [...inMemoryLogs];
  },

  getSyncLogs(): ScanHistoryRecord[] {
    return [...inMemoryLogs];
  },

  async addLog(record: Omit<ScanHistoryRecord, "id_scan_log" | "dicatat_pada">): Promise<ScanHistoryRecord> {
    await loadFromDisk();

    const newRecord: ScanHistoryRecord = {
      id_scan_log: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      dicatat_pada: new Date().toISOString(),
      ...record,
    };

    // Sisipkan di awal (terbaru)
    inMemoryLogs = [newRecord, ...inMemoryLogs.slice(0, 49)];

    try {
      await storage.setItem(STORAGE_KEY, JSON.stringify(inMemoryLogs));
    } catch {
      // Abaikan error disk
    }

    return newRecord;
  },

  async clear(): Promise<void> {
    inMemoryLogs = [];
    try {
      await storage.removeItem(STORAGE_KEY);
    } catch {
      // Abaikan error disk
    }
  },
};
