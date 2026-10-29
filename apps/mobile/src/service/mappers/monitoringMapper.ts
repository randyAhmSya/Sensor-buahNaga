import {
  FILTER_OPTIONS,
  type MonitoringGroup,
  type MonitoringNode,
  type NodeStatus,
} from "@/constant/monitoring";
import type { MonitoringData } from "@/service/monitoringService";

export function formatTanggalGrup(date: Date): string {
  const sekarang = new Date();
  const selisihHari = Math.floor(
    (sekarang.setHours(0, 0, 0, 0) - new Date(date).setHours(0, 0, 0, 0)) /
      (1000 * 60 * 60 * 24),
  );

  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  const strTgl = date.toLocaleDateString("id-ID", options);

  if (selisihHari === 0) return `Hari Ini, ${strTgl}`;
  if (selisihHari === 1) return `Kemarin, ${strTgl}`;
  return strTgl;
}

export function formatJamWib(dateStr?: string | null): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return (
      d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) +
      " WIB"
    );
  } catch {
    return dateStr;
  }
}

export interface MonitoringNodeItemPayload {
  id_sensor?: string;
  kode_perangkat: string;
  kebunNama: string;
  blokNama?: string;
  status_koneksi: string;
  terakhir_terlihat?: string | null;
  suhu: number;
  lux?: number;
  waktuCatat: string;
}

export function mapToMonitoringData(
  rawItems: MonitoringNodeItemPayload[],
): MonitoringData {
  if (rawItems.length === 0) {
    return {
      groups: [],
      filters: FILTER_OPTIONS,
    };
  }

  const monitoringNodes: Array<{ node: MonitoringNode; timestamp: number }> =
    rawItems.map((item) => {
      const isOnline =
        item.status_koneksi === "online" ||
        item.status_koneksi === "terhubung";

      const isProblem: boolean =
        !isOnline ||
        item.status_koneksi === "offline" ||
        item.status_koneksi === "terputus" ||
        item.suhu > 38;

      const nodeStatus: NodeStatus = isProblem ? "problem" : "normal";

      const parsedDate = new Date(item.waktuCatat);
      const timestamp = isNaN(parsedDate.getTime())
        ? Date.now()
        : parsedDate.getTime();

      return {
        timestamp,
        node: {
          id: item.id_sensor || item.kode_perangkat,
          code: item.kode_perangkat,
          location: `${item.kebunNama}${item.blokNama ? ` - ${item.blokNama}` : ""}`,
          time: formatJamWib(item.waktuCatat),
          temperatureC: item.suhu,
          lightLux: item.lux,
          status: nodeStatus,
          statusKoneksi: item.status_koneksi || (isOnline ? "online" : "offline"),
        },
      };
    });

  // Kelompokkan node ke dalam grup tanggal (MonitoringGroup[])
  const groupsMap = new Map<string, MonitoringNode[]>();

  for (const item of monitoringNodes) {
    const d = new Date(item.timestamp);
    const dateLabel = formatTanggalGrup(d);

    const existing = groupsMap.get(dateLabel);
    if (existing) {
      existing.push(item.node);
    } else {
      groupsMap.set(dateLabel, [item.node]);
    }
  }

  const groups: MonitoringGroup[] = Array.from(groupsMap.entries()).map(
    ([dateLabel, nodes]) => ({
      dateLabel,
      nodes,
    }),
  );

  return {
    groups,
    filters: FILTER_OPTIONS,
  };
}
