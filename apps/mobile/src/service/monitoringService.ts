import apiClient from "./apiClient";
import { ensureKebunList } from "./kebunService";
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

export interface NodeSummaryStats {
  total: number;
  online: number;
  offline: number;
  belumTerlihat: number;
}

export interface MonitoringData {
  groups: MonitoringGroup[];
  filters: FilterOption[];
  summary: NodeSummaryStats;
}

/**
 * Mengonsumsi data node sensor secara efisien tanpa loop request telemetri berlebihan:
 * - GET /api/petani/kebun
 * - GET /api/petani/node?kebun_id=... (1x per kebun, bukan per node)
 */
export async function fetchMonitoringData(): Promise<MonitoringData> {
  const kebuns = await ensureKebunList();

  if (kebuns.length === 0) {
    return {
      groups: [],
      filters: FILTER_OPTIONS,
      summary: { total: 0, online: 0, offline: 0, belumTerlihat: 0 },
    };
  }

  // Ambil semua node sensor per kebun (1 request per kebun)
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
      summary: { total: 0, online: 0, offline: 0, belumTerlihat: 0 },
    };
  }

  // Ambil sampel telemetri kebun 1x saja (hanya jika ada node online) untuk data rata-rata suhu & lux
  const onlineNode = flatNodes.find(
    (n) => n.status_koneksi === "online" || n.status_koneksi === "terhubung",
  );
  let defaultSuhu = 28;
  let defaultLux: number | undefined = undefined;

  if (onlineNode) {
    try {
      const teleRes = await apiClient.get<{
        status: string;
        data: BackendReadSensorDTO[];
      }>("/petani/telemetri", {
        params: { sensor_id: onlineNode.id_sensor, limit: 1 },
      });
      const latest = teleRes.data?.data?.[0];
      if (latest) {
        if (latest.suhu !== null && latest.suhu !== undefined) {
          defaultSuhu = Math.round(Number(latest.suhu));
        }
        if (latest.nilai_lux !== null && latest.nilai_lux !== undefined) {
          defaultLux = Math.round(Number(latest.nilai_lux));
        }
      }
    } catch {
      // Abaikan error telemetri sample
    }
  }

  let countOnline = 0;
  let countOffline = 0;
  let countBelumTerlihat = 0;

  const payloadItems: MonitoringNodeItemPayload[] = flatNodes.map((n) => {
    const isOnline =
      n.status_koneksi === "online" || n.status_koneksi === "terhubung";
    const isNeverSeen =
      n.status_koneksi === "belum_pernah_terlihat" || (!n.terakhir_terlihat && !isOnline);

    if (isOnline) {
      countOnline++;
    } else if (isNeverSeen) {
      countBelumTerlihat++;
    } else {
      countOffline++;
    }

    const waktuCatat = n.terakhir_terlihat || null;

    return {
      id_sensor: n.id_sensor,
      kode_perangkat: n.kode_perangkat,
      kebunNama: n.kebunNama,
      blokNama: n.blok?.nama_blok,
      status_koneksi: isOnline
        ? "online"
        : isNeverSeen
          ? "belum_pernah_terlihat"
          : "offline",
      terakhir_terlihat: waktuCatat,
      suhu: isOnline ? defaultSuhu : 0,
      lux: isOnline ? defaultLux : undefined,
      waktuCatat: waktuCatat || "",
    };
  });

  const mapped = mapToMonitoringData(payloadItems);

  return {
    ...mapped,
    summary: {
      total: flatNodes.length,
      online: countOnline,
      offline: countOffline,
      belumTerlihat: countBelumTerlihat,
    },
  };
}
