import apiClient from "./apiClient";
import {
  FILTER_OPTIONS,
  type FilterOption,
  type MonitoringGroup,
} from "@/constant/monitoring";
import type {
  BackendKebunDTO,
  BackendSensorDTO,
  BackendReadSensorDTO,
} from "@/types/api";
import {
  mapToMonitoringData,
  type MonitoringNodeItemPayload,
} from "./mappers/monitoringMapper";

export interface MonitoringData {
  groups: MonitoringGroup[];
  filters: FilterOption[];
}

/**
 * Mengonsumsi data nyata node sensor & telemetri dari API Backend Laravel (AgroLight) melalui DTO & Mapper:
 * - GET /api/petani/kebun
 * - GET /api/petani/node?kebun_id=...
 * - GET /api/petani/telemetri?sensor_id=...
 */
export async function fetchMonitoringData(): Promise<MonitoringData> {
  const kebunRes = await apiClient.get<{ status: string; data: BackendKebunDTO[] }>(
    "/petani/kebun",
  );
  const kebuns: BackendKebunDTO[] = kebunRes.data?.data || [];

  if (kebuns.length === 0) {
    return {
      groups: [],
      filters: FILTER_OPTIONS,
    };
  }

  // Ambil semua node sensor per kebun
  const nodesPerKebun = await Promise.all(
    kebuns.map(async (kebun) => {
      try {
        const res = await apiClient.get<{
          status: string;
          data: BackendSensorDTO[];
        }>("/petani/node", {
          params: { kebun_id: kebun.id_kebun },
        });
        return (res.data?.data || []).map((node) => ({
          ...node,
          kebunNama: kebun.nama_kebun,
        }));
      } catch {
        return [];
      }
    }),
  );

  const flatNodes = nodesPerKebun.flat();

  if (flatNodes.length === 0) {
    return {
      groups: [],
      filters: FILTER_OPTIONS,
    };
  }

  // Ambil pembacaan telemetri terakhir untuk tiap node
  const payloadItems: MonitoringNodeItemPayload[] = await Promise.all(
    flatNodes.map(async (n) => {
      let latestSuhu = 28;
      let latestLux: number | undefined = undefined;
      let waktuCatat = n.terakhir_terlihat || new Date().toISOString();

      try {
        const teleRes = await apiClient.get<{
          status: string;
          data: BackendReadSensorDTO[];
        }>("/petani/telemetri", {
          params: { sensor_id: n.id_sensor, limit: 1 },
        });

        const latest = teleRes.data?.data?.[0];
        if (latest) {
          if (latest.suhu !== null && latest.suhu !== undefined) {
            latestSuhu = Math.round(Number(latest.suhu));
          }
          if (latest.nilai_lux !== null && latest.nilai_lux !== undefined) {
            latestLux = Math.round(Number(latest.nilai_lux));
          }
          if (latest.dicatat_pada) {
            waktuCatat = latest.dicatat_pada;
          }
        }
      } catch {
        // Abaikan error telemetri individual agar node tetap muncul
      }

      return {
        id_sensor: n.id_sensor,
        kode_perangkat: n.kode_perangkat,
        kebunNama: n.kebunNama,
        blokNama: n.blok?.nama_blok,
        status_koneksi: n.status_koneksi,
        terakhir_terlihat: n.terakhir_terlihat,
        suhu: latestSuhu,
        lux: latestLux,
        waktuCatat,
      };
    }),
  );

  return mapToMonitoringData(payloadItems);
}
