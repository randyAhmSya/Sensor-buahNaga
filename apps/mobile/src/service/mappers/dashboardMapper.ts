import {
  QUICK_ACTIONS,
  type ActionIssueGroup,
  type ActivityItem,
  type GardenStats,
  type HarvestEstimate,
  type WeatherInfo,
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

export function formatJamWib(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return (
      d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
      ' WIB'
    );
  } catch {
    return dateStr;
  }
}

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

  // 2. Olah cuaca dari sensor
  const latestTelemetry = telemetryList[0];
  const suhu = latestTelemetry?.suhu
    ? Math.round(Number(latestTelemetry.suhu))
    : 28;
  const lux = latestTelemetry?.nilai_lux
    ? Number(latestTelemetry.nilai_lux)
    : 0;
  const weatherCondition =
    lux > 800
      ? 'Cerah Terik'
      : lux > 300
        ? 'Cerah Berawan'
        : lux > 50
          ? 'Mendung'
          : 'Malam Hari';

  const weather: WeatherInfo = {
    temperatureC: suhu,
    condition: weatherCondition,
  };

  // 3. Aktivitas sensor
  const activities: ActivityItem[] = telemetryList
    .slice(0, 5)
    .map((item, index) => {
      const luxVal = Number(item.nilai_lux || 0);
      return {
        id: item.id_read_sensor || `act-${index}`,
        nodeId: activeSensor?.kode_perangkat || `Node-${index + 1}`,
        location: kebuns[0]?.nama_kebun || 'Kebun Buah Naga',
        lightLux: Math.round(luxVal),
        powerWh: Math.round(luxVal * 0.1),
        time: formatJamWib(item.dicatat_pada),
      };
    });

  // 4. Estimasi panen riil dari backend (UUID id_siklus_panen valid)
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

  // 5. Action Needed (Masalah perangkat)
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
        title: 'Perangkat Node Offline - Terputus dari Gateway',
        location: kebuns[0]?.nama_kebun || 'Area Kebun',
        icon: 'wifi-outline',
        severity: 'warning',
      })),
    });
  }

  return {
    weather,
    stats,
    quickActions: QUICK_ACTIONS,
    activities,
    harvestEstimates,
    actionIssueGroups,
    blokLampuSummaries,
  };
}
