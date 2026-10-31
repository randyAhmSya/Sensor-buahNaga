import apiClient from "./apiClient";
import { ensureKebunList } from "./kebunService";
import type {
  ActionIssueGroup,
  GardenStats,
  HarvestEstimate,
  QuickAction,
} from "@/constant/dashboard";
import { QUICK_ACTIONS } from "@/constant/dashboard";
import type {
  BackendDashboardData,
  DashboardNodeItem,
  DashboardBacaanTerakhir,
} from "@/types/dashboard";
import type { BackendKebunDTO } from "@/types/api";
import type { BlokLampuSummary } from "@/types/notification";
import { hitungHariSisa, hitungRipenessPercent } from "@/types/harvest";

export interface BackendBlokDTO {
  id_blok: string;
  nama_blok: string;
  kebun_id: string;
  deskripsi?: string | null;
  luas_m2?: number | null;
  url_foto?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardData {
  kebunInfo: {
    id_kebun: string;
    nama_kebun: string;
    lokasi_kebun: string;
    status_kebun: string;
  };
  ringkasan: {
    jumlah_blok: number;
    jumlah_node: number;
    node_online: number;
    node_offline: number;
    node_belum_terlihat: number;
    siklus_berjalan: number;
    bacaan_terbaru: DashboardBacaanTerakhir | null;
  };
  stats: GardenStats;
  quickActions: QuickAction[];
  harvestEstimates: HarvestEstimate[];
  actionIssueGroups: ActionIssueGroup[];
  blokLampuSummaries: BlokLampuSummary[];
}

function getEmptyDashboardData(farmName: string, farmLocation: string): DashboardData {
  return {
    kebunInfo: {
      id_kebun: "",
      nama_kebun: farmName,
      lokasi_kebun: farmLocation,
      status_kebun: "aktif",
    },
    ringkasan: {
      jumlah_blok: 0,
      jumlah_node: 0,
      node_online: 0,
      node_offline: 0,
      node_belum_terlihat: 0,
      siklus_berjalan: 0,
      bacaan_terbaru: null,
    },
    stats: {
      totalGardens: 0,
      activeNodes: 0,
      avgHealthPercent: 100,
    },
    quickActions: QUICK_ACTIONS,
    harvestEstimates: [],
    actionIssueGroups: [],
    blokLampuSummaries: [],
  };
}

/**
 * Mengonsumsi data nyata dari API Backend Laravel (AgroLight) melalui endpoint agregasi tunggal:
 * GET /api/petani/dashboard?kebun_id={id}
 * Tidak melakukan request paralel ekstra ke telemetri atau node.
 */
export async function fetchDashboardData(specificKebunId?: string): Promise<DashboardData> {
  let kebunId = specificKebunId;
  let farmName = "Kebun Buah Naga";
  let farmLocation = "Banyuwangi";

  // 1. Ambil kebun pertama jika ID belum ditentukan (via deduplikasi TanStack Query)
  if (!kebunId) {
    const kebuns = await ensureKebunList();
    if (kebuns.length > 0) {
      kebunId = kebuns[0].id_kebun;
      farmName = kebuns[0].nama_kebun;
      farmLocation = kebuns[0].lokasi_kebun || farmLocation;
    }
  }

  if (!kebunId) {
    return getEmptyDashboardData(farmName, farmLocation);
  }

  // 2. Request tunggal ke endpoint agregasi dashboard backend
  const res = await apiClient.get<{
    status: string;
    pesan?: string;
    data: BackendDashboardData;
  }>("/petani/dashboard", {
    params: { kebun_id: kebunId },
  });

  const raw = res.data.data;

  // 3. Kumpulkan daftar node offline untuk aksi peringatan
  const allOfflineNodes: DashboardNodeItem[] = [];
  raw.blok.forEach((b) => {
    b.node.forEach((n) => {
      if (n.status === "offline") {
        allOfflineNodes.push(n);
      }
    });
  });

  // 4. Ringkasan status lampu blok
  const blokLampuSummaries: BlokLampuSummary[] = raw.blok.map((b) => {
    const total = b.jumlah_node;
    const online = b.node.filter((n) => n.status === "online").length;
    const offline = b.node.filter((n) => n.status === "offline").length;
    const batas = raw.ringkasan.batas_offline_detik || 90;
    const persentase = total > 0 ? Math.round((online / total) * 100) : 0;

    let statusKoneksi: "optimal" | "sebagian_offline" | "semua_offline" | "kosong" =
      "optimal";
    if (total === 0) statusKoneksi = "kosong";
    else if (online === 0) statusKoneksi = "semua_offline";
    else if (offline > 0) statusKoneksi = "sebagian_offline";

    return {
      idBlok: b.id_blok,
      namaBlok: b.nama_blok,
      namaKebun: raw.kebun.nama_kebun || farmName,
      jumlahLampu: total,
      jumlahOnline: online,
      jumlahOffline: offline,
      persentaseOnline: persentase,
      statusKoneksi,
      batasOfflineDetik: batas,
    };
  });

  // 5. Estimasi panen dari blok dengan siklus aktif
  const harvestEstimates: HarvestEstimate[] = raw.blok
    .filter((b) => b.siklus_aktif && b.siklus_aktif.status_siklus === "BERJALAN")
    .map((b, idx) => {
      const s = b.siklus_aktif!;
      return {
        id: s.id_siklus_panen || `h-${idx}`,
        nodeId: b.nama_blok,
        ripenessPercent: hitungRipenessPercent(
          s.tanggal_penyinaran,
          s.estimasi_tanggal_panen,
        ),
        daysRemaining: hitungHariSisa(s.estimasi_tanggal_panen),
      };
    });

  // 6. Action Needed (Masalah perangkat node offline)
  const actionIssueGroups: ActionIssueGroup[] = [];
  if (allOfflineNodes.length > 0) {
    actionIssueGroups.push({
      category: "Perangkat Terputus",
      issues: allOfflineNodes.map((node) => ({
        id: node.id_sensor,
        nodeId: node.kode_perangkat,
        title: "Perangkat Node Offline - Terputus dari Gateway",
        location: raw.kebun.nama_kebun || farmName,
        icon: "wifi-outline",
        severity: "warning",
      })),
    });
  }

  const totalGardens = 1;
  const activeNodesCount = raw.ringkasan.node_online;
  const avgHealthPercent =
    raw.ringkasan.jumlah_node > 0
      ? Math.round((raw.ringkasan.node_online / raw.ringkasan.jumlah_node) * 100)
      : 100;

  return {
    kebunInfo: {
      id_kebun: raw.kebun.id_kebun,
      nama_kebun: raw.kebun.nama_kebun,
      lokasi_kebun: raw.kebun.lokasi_kebun || farmLocation,
      status_kebun: raw.kebun.status_kebun || "aktif",
    },
    ringkasan: {
      jumlah_blok: raw.ringkasan.jumlah_blok,
      jumlah_node: raw.ringkasan.jumlah_node,
      node_online: raw.ringkasan.node_online,
      node_offline: raw.ringkasan.node_offline,
      node_belum_terlihat: raw.ringkasan.node_belum_terlihat,
      siklus_berjalan: raw.ringkasan.siklus_berjalan,
      bacaan_terbaru: raw.ringkasan.bacaan_terbaru ?? null,
    },
    stats: {
      totalGardens,
      activeNodes: activeNodesCount,
      avgHealthPercent,
    },
    quickActions: QUICK_ACTIONS,
    harvestEstimates,
    actionIssueGroups,
    blokLampuSummaries,
  };
}
