import {
  FILTER_OPTIONS,
  type MonitoringGroup,
  type MonitoringNode,
  type NodeStatus,
} from "@/constant/monitoring";
import type { DashboardData } from "@/service/dashboardService";
import type { MonitoringData, NodeSummaryStats } from "@/service/monitoringService";
import {
  formatJamWib,
  formatTanggalGrupWib,
  formatWaktuRelatifWib,
  parseUtcDate,
} from "@/utils/date";

export { formatJamWib, formatTanggalGrupWib as formatTanggalGrup };

export interface MonitoringNodeItemPayload {
  id_sensor?: string;
  kode_perangkat: string;
  kebunNama: string;
  blokNama?: string;
  status_koneksi: string;
  terakhir_terlihat?: string | null;
  suhu?: number | null;
  lux?: number | null;
  waktuCatat?: string | null;
  isBasi?: boolean;
}

/**
 * Memetakan data dari agregasi Dashboard (blok dan ringkasan kebun aktif)
 * menjadi struktur data layar Monitoring tanpa request jaringan baru.
 */
export function mapDashboardToMonitoringData(dashboard: DashboardData): MonitoringData {
  const summary: NodeSummaryStats = {
    total: dashboard.ringkasan.jumlah_node,
    online: dashboard.ringkasan.node_online,
    offline: dashboard.ringkasan.node_offline,
    belumTerlihat: dashboard.ringkasan.node_belum_terlihat,
  };

  if (!dashboard.blok || dashboard.blok.length === 0) {
    return {
      groups: [],
      filters: FILTER_OPTIONS,
      summary,
    };
  }

  const nodesWithTime: Array<{ node: MonitoringNode; timestamp: number }> = [];

  for (const blok of dashboard.blok) {
    for (const item of blok.node) {
      const isOnline = item.status === "online" || item.status_online === true;
      const isProblem: boolean = !isOnline;
      const nodeStatus: NodeStatus = isProblem ? "problem" : "normal";

      const dTerakhir = parseUtcDate(item.terakhir_terlihat);
      const dBacaan = parseUtcDate(item.bacaan_terakhir?.dicatat_pada);

      // Titik waktu acuan grouping: bacaan terbaru atau waktu terakhir terlihat
      const refDate = dBacaan || dTerakhir || new Date(0);
      const timestamp = refDate.getTime();

      const displayTime = item.terakhir_terlihat
        ? formatJamWib(item.terakhir_terlihat)
        : "Belum ada data";

      const isBasi = item.bacaan_terakhir ? item.bacaan_terakhir.basi : false;
      const waktuRelatif = item.bacaan_terakhir?.dicatat_pada
        ? formatWaktuRelatifWib(item.bacaan_terakhir.dicatat_pada)
        : null;

      const node: MonitoringNode = {
        id: item.id_sensor || item.kode_perangkat,
        code: item.kode_perangkat,
        location: `${dashboard.kebunInfo.nama_kebun} - ${blok.nama_blok}`,
        time: displayTime,
        temperatureC: item.bacaan_terakhir?.suhu ?? null,
        lightLux: item.bacaan_terakhir?.nilai_lux ?? null,
        isBasi,
        waktuRelatif,
        dicatatPada: item.bacaan_terakhir?.dicatat_pada ?? item.terakhir_terlihat ?? null,
        status: nodeStatus,
        statusKoneksi: item.status,
      };

      nodesWithTime.push({ node, timestamp });
    }
  }

  // Urutkan node dari yang paling mutakhir
  nodesWithTime.sort((a, b) => b.timestamp - a.timestamp);

  // Kelompokkan node ke dalam grup tanggal kalender WIB murni
  const groupsMap = new Map<string, MonitoringNode[]>();

  for (const item of nodesWithTime) {
    // Jika belum pernah terlihat / belum ada data waktu, kelompokkan tersendiri atau dengan tanggal fallback
    const dateLabel = item.timestamp === 0
      ? "Belum Ada Riwayat"
      : formatTanggalGrupWib(item.timestamp);

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
    summary,
  };
}

/**
 * Mapper payload lama (dipertahankan untuk kompatibilitas pengujian/backward compatibility).
 */
export function mapToMonitoringData(
  rawItems: MonitoringNodeItemPayload[],
): MonitoringData {
  if (rawItems.length === 0) {
    return {
      groups: [],
      filters: FILTER_OPTIONS,
      summary: { total: 0, online: 0, offline: 0, belumTerlihat: 0 },
    };
  }

  let onlineCount = 0;
  let offlineCount = 0;
  let belumTerlihatCount = 0;

  for (const item of rawItems) {
    if (item.status_koneksi === "online" || item.status_koneksi === "terhubung") {
      onlineCount++;
    } else if (
      item.status_koneksi === "belum_pernah_terlihat" ||
      (!item.terakhir_terlihat && item.status_koneksi !== "online")
    ) {
      belumTerlihatCount++;
    } else {
      offlineCount++;
    }
  }

  const summary: NodeSummaryStats = {
    total: rawItems.length,
    online: onlineCount,
    offline: offlineCount,
    belumTerlihat: belumTerlihatCount,
  };

  const monitoringNodes: Array<{ node: MonitoringNode; timestamp: number }> =
    rawItems.map((item) => {
      const isOnline =
        item.status_koneksi === "online" ||
        item.status_koneksi === "terhubung";

      const isProblem: boolean = !isOnline;
      const nodeStatus: NodeStatus = isProblem ? "problem" : "normal";

      const parsedDate = parseUtcDate(item.waktuCatat);
      const timestamp = parsedDate ? parsedDate.getTime() : Date.now();

      return {
        timestamp,
        node: {
          id: item.id_sensor || item.kode_perangkat,
          code: item.kode_perangkat,
          location: `${item.kebunNama}${item.blokNama ? ` - ${item.blokNama}` : ""}`,
          time: formatJamWib(item.terakhir_terlihat),
          temperatureC: item.suhu ?? null,
          lightLux: item.lux ?? null,
          isBasi: item.isBasi ?? false,
          waktuRelatif: item.waktuCatat ? formatWaktuRelatifWib(item.waktuCatat) : null,
          dicatatPada: item.waktuCatat ?? null,
          status: nodeStatus,
          statusKoneksi: item.status_koneksi || (isOnline ? "online" : "offline"),
        },
      };
    });

  const groupsMap = new Map<string, MonitoringNode[]>();

  for (const item of monitoringNodes) {
    const dateLabel = formatTanggalGrupWib(item.timestamp);
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
    summary,
  };
}
