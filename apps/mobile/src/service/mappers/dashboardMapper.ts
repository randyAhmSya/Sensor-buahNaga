import {
  QUICK_ACTIONS,
  type ActionIssueGroup,
  type GardenStats,
  type HarvestEstimate,
} from '@/constant/dashboard';
import type { DashboardData } from '@/service/dashboardService';
import type {
  BackendKebunDTO,
  BackendSensorDTO,
  BackendReadSensorDTO,
  BackendSiklusPanenDTO,
} from '@/types/api';
import type { BlokLampuSummary } from '@/types/notification';
import { hitungHariSisa, hitungRipenessPercent } from '@/types/harvest';

export function mapToDashboardData({
  kebuns,
  allNodes,
  telemetryList,
  siklusList,
  blokLampuSummaries = [],
}: {
  kebuns: BackendKebunDTO[];
  allNodes: BackendSensorDTO[];
  telemetryList: BackendReadSensorDTO[];
  siklusList: BackendSiklusPanenDTO[];
  blokLampuSummaries?: BlokLampuSummary[];
}): DashboardData {
  const activeSensor =
    allNodes.find(
      (n) => n.status_koneksi === 'online' || n.status_koneksi === 'terhubung',
    ) || allNodes[0];

  // 1. Statistik kebun
  const totalGardens = kebuns.length;
  const activeNodesCount = allNodes.filter(
    (n) => n.status_koneksi === 'online' || n.status_koneksi === 'terhubung',
  ).length;
  const avgHealthPercent =
    allNodes.length > 0
      ? Math.round((activeNodesCount / allNodes.length) * 100)
      : totalGardens > 0
        ? 100
        : 0;

  const stats: GardenStats = {
    totalGardens,
    activeNodes: activeNodesCount,
    avgHealthPercent,
  };

  // 2. Bacaan terbaru dari telemetri aktual (bila ada)
  const latestTelemetry = telemetryList[0];
  const bacaanTerbaru = latestTelemetry
    ? {
        nilai_lux: Math.round(Number(latestTelemetry.nilai_lux || 0)),
        suhu:
          latestTelemetry.suhu !== null && latestTelemetry.suhu !== undefined
            ? Math.round(Number(latestTelemetry.suhu))
            : null,
        dicatat_pada: latestTelemetry.dicatat_pada || new Date().toISOString(),
        basi: false,
        id_sensor: activeSensor?.id_sensor,
        kode_perangkat: activeSensor?.kode_perangkat,
      }
    : null;

  // 3. Estimasi panen riil dari backend
  const harvestEstimates: HarvestEstimate[] = siklusList
    .filter((s) => s.status_siklus === 'BERJALAN')
    .slice(0, 5)
    .map((s, idx) => ({
      id: s.id_siklus_panen || `h-${idx}`,
      nodeId: s.blok?.nama_blok || activeSensor?.kode_perangkat || `Blok Lahan`,
      ripenessPercent: hitungRipenessPercent(
        s.tanggal_penyinaran,
        s.estimasi_tanggal_panen,
      ),
      daysRemaining: hitungHariSisa(s.estimasi_tanggal_panen),
    }));

  // 4. Action Needed (Masalah perangkat)
  const offlineNodes = allNodes.filter(
    (n) => n.status_koneksi === 'offline' || n.status_koneksi === 'terputus',
  );

  const actionIssueGroups: ActionIssueGroup[] = [];

  if (offlineNodes.length > 0) {
    actionIssueGroups.push({
      category: 'Perangkat Terputus',
      issues: offlineNodes.map((node) => ({
        id: node.id_sensor,
        nodeId: node.kode_perangkat,
        title: 'Node Sensor Offline',
        location: kebuns[0]?.nama_kebun || 'Kebun Buah Naga',
        icon: 'wifi-outline',
        severity: 'warning',
      })),
    });
  }

  const kebunInfo = {
    id_kebun: kebuns[0]?.id_kebun || '',
    nama_kebun: kebuns[0]?.nama_kebun || 'Kebun Buah Naga',
    lokasi_kebun: kebuns[0]?.lokasi_kebun || 'Banyuwangi',
    status_kebun: kebuns[0]?.status_kebun ? String(kebuns[0].status_kebun) : 'aktif',
  };

  const ringkasan = {
    jumlah_blok: blokLampuSummaries.length,
    jumlah_node: allNodes.length,
    node_online: activeNodesCount,
    node_offline: offlineNodes.length,
    node_belum_terlihat: Math.max(0, allNodes.length - activeNodesCount - offlineNodes.length),
    siklus_berjalan: harvestEstimates.length,
    bacaan_terbaru: bacaanTerbaru,
  };

  return {
    kebunInfo,
    ringkasan,
    stats,
    quickActions: QUICK_ACTIONS,
    harvestEstimates,
    actionIssueGroups,
    blokLampuSummaries,
  };
}
