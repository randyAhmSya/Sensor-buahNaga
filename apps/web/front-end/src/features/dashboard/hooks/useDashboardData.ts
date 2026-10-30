import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trees, Grid, Router, Repeat } from 'lucide-react';
import { useFarmsQuery } from '@/hooks/queries/useFarmsQuery';
import { useDashboard } from './useDashboard';
import { petaniSubscriptionService } from '@/services/petaniSubscriptionService';
import { notificationService } from '@/services/notificationService';
import { scheduleService } from '@/services/scheduleService';
import { fetchLogEnergy } from '@/services/energyService';
import {
  petaniSubscriptionKeys,
  notificationKeys,
  scheduleKeys,
  energyKeys,
} from '@/services/queryKeys';
import type { DashboardCardMetricItem, TelemetryNodeRow } from '@/types/telemetry';
import type { FarmItem } from '@/types/farm.types';
import type { NodeSensorBackend } from '@/types/node.types';
import type { HarvestCycle, HarvestCycleStatus } from '@/features/harvests/types/harvest.types';
import type { StatusLanggananPetani } from '@/types/petaniSubscription.types';
import type { DashboardAlertItem } from '../components/DashboardAlertNotificationsWidget';
import type { BlockNodeOption, DimmingLogPoint } from '../components/IntensityDimmingLineChart';
import type { NightlyEnergyPoint } from '../components/NightlyEnergyBarChart';

export interface ActiveBlockOverviewItem {
  id: string;
  name: string;
  nodeCount: number;
  lightIntensity: number;
  schedule: string;
  status: string;
}

export interface DashboardData {
  farms: FarmItem[];
  nodes: NodeSensorBackend[];
  cycles: HarvestCycle[];
  totalFarms: number;
  totalBlocks: number;
  totalNodes: number;
  onlineNodes: number;
  offlineNodes: number;
  runningHarvestCycles: number;
  metricCards: DashboardCardMetricItem[];
  recentActivities: TelemetryNodeRow[];
  activeBlocksList: ActiveBlockOverviewItem[];
  subscriptionStatus: StatusLanggananPetani | null;
  alertItems: DashboardAlertItem[];
  dimmingOptions: BlockNodeOption[];
  selectedBlockNodeId: string;
  setSelectedBlockNodeId: (id: string) => void;
  dimmingChartData: DimmingLogPoint[];
  isManualDimmingMode: boolean;
  manualBrightnessPercent: number;
  nightlyEnergyData: NightlyEnergyPoint[];
  totalNightlyKwh: number;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function useDashboardData(): DashboardData {
  // 1. Ambil daftar kebun via shared query (deduplikasi bersama Layout/Navbar)
  const { data: farms = [], isLoading: isLoadingFarms } = useFarmsQuery();

  const activeKebunId = useMemo(() => {
    return farms[0]?.id || '';
  }, [farms]);

  // 2. Query Utama Dashboard Tunggal via useDashboard (queryKey: ['dashboard', kebunId])
  const dashboardQuery = useDashboard(activeKebunId);
  const dashboard = dashboardQuery.data ?? null;

  // 3. Shared Query: Status Langganan Petani (Deduplikasi bersama DashboardLayout)
  const subscriptionQuery = useQuery({
    queryKey: petaniSubscriptionKeys.status(),
    queryFn: () => petaniSubscriptionService.getStatus(),
    staleTime: 60_000,
  });
  const subscriptionStatus = subscriptionQuery.data ?? null;

  // 4. Shared Query: Notifikasi Petani
  const notificationsQuery = useQuery({
    queryKey: notificationKeys.list({}),
    queryFn: () => notificationService.getPetaniNotifications(),
    staleTime: 30_000,
  });
  const notifications = notificationsQuery.data ?? [];

  // 5. Opsi Dropdown Auto-Dimming diekstrak langsung dari dashboard.blok[]
  const dimmingOptions: BlockNodeOption[] = useMemo(() => {
    if (!dashboard?.blok) return [];
    const options: BlockNodeOption[] = [];
    const farmName = dashboard.kebun?.nama_kebun || 'Kebun';

    for (const b of dashboard.blok) {
      const isManual = b.jadwal?.jadwal?.mode === 'manual';
      const manualBrightness =
        b.jadwal?.jadwal?.instensitas_cahaya ?? b.jadwal?.jadwal?.target_lux ?? 80;

      for (const n of b.node || []) {
        const sensorId = (n.id_sensor || '').trim();
        if (UUID_REGEX.test(sensorId)) {
          options.push({
            id: sensorId,
            name: `${farmName} - ${b.nama_blok} (${n.kode_perangkat})`,
            isManual,
            manualBrightness,
          });
        }
      }
    }
    return options;
  }, [dashboard]);

  // State sensor terpilih pada dropdown grafik peredupan
  const [selectedBlockNodeId, setSelectedBlockNodeIdState] = useState<string>('');

  useEffect(() => {
    if (dimmingOptions.length > 0) {
      const isCurrentValid = dimmingOptions.some((opt) => opt.id === selectedBlockNodeId);
      if (!selectedBlockNodeId || !isCurrentValid) {
        setSelectedBlockNodeIdState(dimmingOptions[0].id);
      }
    } else if (selectedBlockNodeId) {
      setSelectedBlockNodeIdState('');
    }
  }, [dimmingOptions, selectedBlockNodeId]);

  const handleSelectDimmingNode = useCallback((sensorId: string) => {
    setSelectedBlockNodeIdState(sensorId);
  }, []);

  // 6. Dependent Query: Log Peredupan Auto-Dimming (Hanya jalan setelah dashboard loaded & sensorId valid)
  const isDimmingEnabled = Boolean(
    dashboard && selectedBlockNodeId && UUID_REGEX.test(selectedBlockNodeId)
  );

  const dimmingQuery = useQuery({
    queryKey: scheduleKeys.list({ sensor_id: selectedBlockNodeId }),
    queryFn: async () => {
      const dimmingData = await scheduleService.getLogPeredupan({
        sensor_id: selectedBlockNodeId,
        jam: 12,
        interval_menit: 10,
      });

      if (dimmingData && Array.isArray(dimmingData.titik)) {
        return dimmingData.titik.map((t) => ({
          jam: t.waktu,
          kecerahan: t.kecerahan_persen,
          lux: t.lux,
        }));
      }
      return [];
    },
    enabled: isDimmingEnabled,
    staleTime: 30_000,
  });

  const dimmingChartData: DimmingLogPoint[] = dimmingQuery.data ?? [];

  // Deteksi mode manual dan kecerahan dari sensor terpilih
  const selectedOption = useMemo(() => {
    return dimmingOptions.find((opt) => opt.id === selectedBlockNodeId);
  }, [dimmingOptions, selectedBlockNodeId]);

  const isManualDimmingMode = Boolean(selectedOption?.isManual);
  const manualBrightnessPercent = selectedOption?.manualBrightness ?? 100;

  // 7. Dependent Query: Log Konsumsi Energi 7 Hari Terakhir
  const firstValidSensorId = useMemo(() => {
    return dimmingOptions[0]?.id || '';
  }, [dimmingOptions]);

  const isEnergyEnabled = Boolean(
    dashboard && firstValidSensorId && UUID_REGEX.test(firstValidSensorId)
  );

  const energyQuery = useQuery({
    queryKey: energyKeys.logs(firstValidSensorId),
    queryFn: async () => {
      const energyRes = await fetchLogEnergy(firstValidSensorId, 100);
      if (!energyRes || !energyRes.riwayat || energyRes.riwayat.length === 0) {
        return { points: [] as NightlyEnergyPoint[], totalKwh: 0 };
      }

      const dateMap = new Map<string, number>();
      for (const item of energyRes.riwayat) {
        const dateStr = item.dicatat_pada.slice(0, 10);
        const watt = item.konsumsi_watt || 0;
        const kwh = watt / 1000;
        dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + kwh);
      }

      const sortedDates = Array.from(dateMap.keys()).sort().slice(-7);
      const points: NightlyEnergyPoint[] = sortedDates.map((d) => {
        const dt = new Date(d);
        const formattedDate = dt.toLocaleDateString('id-ID', {
          weekday: 'short',
          day: 'numeric',
        });
        return {
          tanggal: formattedDate,
          kwh: Number((dateMap.get(d) || 0).toFixed(2)),
          rawDate: d,
        };
      });

      return { points, totalKwh: energyRes.total_kwh };
    },
    enabled: isEnergyEnabled,
    staleTime: 30_000,
  });

  const nightlyEnergyData: NightlyEnergyPoint[] = energyQuery.data?.points ?? [];
  const totalNightlyKwh: number = energyQuery.data?.totalKwh ?? 0;

  // 8. Pemetaan Siklus Panen (Urutan Ascending berdasarkan estimasi panen terdekat)
  const cycles: HarvestCycle[] = useMemo(() => {
    if (!dashboard?.blok) return [];
    const farmName = dashboard.kebun?.nama_kebun || 'Kebun';
    const runningCycles: HarvestCycle[] = [];

    for (const b of dashboard.blok) {
      if (b.siklus_aktif) {
        runningCycles.push({
          id_siklus_panen: b.siklus_aktif.id_siklus_panen,
          block_id: b.id_blok,
          tanggal_penyinaran: b.siklus_aktif.tanggal_penyinaran,
          target_hari_berbunga: b.siklus_aktif.target_hari_berbunga,
          target_hari_panen_setelah_bunga: b.siklus_aktif.target_hari_panen_setelah_bunga,
          estimasi_tanggal_panen: b.siklus_aktif.estimasi_tanggal_panen,
          tanggal_berbunga_aktual: b.siklus_aktif.tanggal_berbunga_aktual,
          status_siklus: (b.siklus_aktif.status_siklus as HarvestCycleStatus) || 'BERJALAN',
          blockName: b.nama_blok,
          farmName,
        });
      }
    }

    return runningCycles.sort((a, b) => {
      const timeA = new Date(a.estimasi_tanggal_panen).getTime() || Infinity;
      const timeB = new Date(b.estimasi_tanggal_panen).getTime() || Infinity;
      return timeA - timeB;
    });
  }, [dashboard]);

  // 9. Kompatibilitas NodeSensorBackend dari dashboard.blok[]
  const nodes: NodeSensorBackend[] = useMemo(() => {
    if (!dashboard?.blok) return [];
    const farmId = dashboard.kebun?.id_kebun || '';
    const farmName = dashboard.kebun?.nama_kebun || '';

    return dashboard.blok.flatMap((b) =>
      (b.node || []).map((n) => ({
        id_sensor: n.id_sensor,
        id: n.id_sensor,
        blok_id: b.id_blok,
        gateway_id: null,
        qr_id: null,
        kode_perangkat: n.kode_perangkat,
        tipe_sensor: 'node_sensor',
        status_koneksi: n.status === 'online' ? 'aktif' : 'nonaktif',
        terakhir_terlihat: n.terakhir_terlihat,
        blok: {
          id_blok: b.id_blok,
          id: b.id_blok,
          nama_blok: b.nama_blok,
          kebun_id: farmId,
          kebun: {
            id_kebun: farmId,
            id: farmId,
            nama_kebun: farmName,
          },
        },
        gateway: null,
        qr: null,
      }))
    );
  }, [dashboard]);

  // 10. Pemetaan Operasional Blok Lahan
  const activeBlocksList: ActiveBlockOverviewItem[] = useMemo(() => {
    if (!dashboard?.blok) return [];
    const farmName = dashboard.kebun?.nama_kebun || 'Kebun';

    return dashboard.blok.map((b) => {
      const nodeCount = b.jumlah_node || b.node?.length || 0;
      const hasOnline = (b.node || []).some((n) => n.status === 'online' || n.status_online);

      let scheduleText = '18:00 - 05:00 WIB';
      const jadwalLampu = b.jadwal?.jadwal;
      if (jadwalLampu?.jam_mulai_nyala && jadwalLampu?.jam_akhir_nyala) {
        const mulai = jadwalLampu.jam_mulai_nyala.slice(0, 5);
        const akhir = jadwalLampu.jam_akhir_nyala.slice(0, 5);
        scheduleText = `${mulai} - ${akhir} WIB`;
      }

      const lightIntensity = hasOnline
        ? jadwalLampu?.instensitas_cahaya || 100
        : 0;

      return {
        id: b.id_blok,
        name: `${farmName} - ${b.nama_blok}`,
        nodeCount,
        lightIntensity,
        schedule: scheduleText,
        status: hasOnline ? 'Menyala' : 'Standby',
      };
    });
  }, [dashboard]);

  // 11. Pemetaan Aktivitas Telemetri Riil
  const recentActivities: TelemetryNodeRow[] = useMemo(() => {
    if (!dashboard?.blok) return [];
    const farmName = dashboard.kebun?.nama_kebun || 'Kebun';
    const rows: TelemetryNodeRow[] = [];

    for (const b of dashboard.blok) {
      for (const n of b.node || []) {
        const isOnline = n.status === 'online' || n.status_online;
        const displayStatus =
          n.status === 'online' || n.status_online
            ? 'Online'
            : n.status === 'offline'
              ? 'Offline'
              : 'Belum pernah terhubung';

        rows.push({
          nodeCode: n.kode_perangkat,
          location: `${farmName} (${b.nama_blok})`,
          luxValue: isOnline ? 'Terhubung' : '- lx',
          powerConsumption: isOnline ? 'Aktif' : '- W',
          recordedTime: n.terakhir_terlihat || 'Belum ada data',
          status: displayStatus,
        });
      }
    }
    return rows;
  }, [dashboard]);

  // 12. Metrik Kartu KPI
  const totalFarms = farms.length;
  const totalBlocks = dashboard?.ringkasan.jumlah_blok ?? 0;
  const totalNodes = dashboard?.ringkasan.jumlah_node ?? 0;
  const onlineNodes = dashboard?.ringkasan.node_online ?? 0;
  const offlineNodes = dashboard?.ringkasan.node_offline ?? 0;
  const runningHarvestCycles = dashboard?.ringkasan.siklus_berjalan ?? 0;

  const metricCards: DashboardCardMetricItem[] = useMemo(() => [
    {
      title: 'Total Lahan Kebun',
      value: totalFarms,
      unit: 'Lokasi',
      icon: Trees,
      iconColor: 'text-emerald-600',
      badgeText: totalFarms > 0 ? `${totalFarms} Lokasi` : undefined,
      badgeVariant: 'emerald',
    },
    {
      title: 'Jumlah Blok Aktif',
      value: totalBlocks,
      unit: 'Blok',
      icon: Grid,
      iconColor: 'text-blue-600',
      badgeText: totalBlocks > 0 ? `${totalBlocks} Blok` : undefined,
      badgeVariant: 'emerald',
    },
    {
      title: 'Node Lampu IoT',
      value: onlineNodes,
      unit: 'Online',
      unitColor: 'text-emerald-600',
      icon: Router,
      iconColor: 'text-emerald-700',
      badgeText:
        offlineNodes > 0
          ? `${offlineNodes} Offline (Total ${totalNodes})`
          : totalNodes > 0
            ? `Total ${totalNodes} Node`
            : '0 Terpasang',
      badgeVariant:
        offlineNodes > 0 ? 'rose' : onlineNodes > 0 ? 'emerald' : 'slate',
    },
    {
      title: 'Siklus Panen Berjalan',
      value: runningHarvestCycles,
      unit: 'Batch',
      icon: Repeat,
      iconColor: 'text-emerald-700',
      badgeText: runningHarvestCycles > 0 ? 'Berjalan' : undefined,
      badgeVariant: 'emerald',
    },
  ], [totalFarms, totalBlocks, totalNodes, onlineNodes, offlineNodes, runningHarvestCycles]);

  // 13. Peringatan & Notifikasi (Alerts)
  const alertItems: DashboardAlertItem[] = useMemo(() => {
    const items: DashboardAlertItem[] = [];

    // 1. Alert status langganan
    if (subscriptionStatus) {
      if (subscriptionStatus.status_langganan === 'kadaluarsa') {
        items.push({
          id: 'sub-expired',
          title: 'Langganan Kadaluarsa',
          description: 'Masa aktif langganan akun Anda telah habis. Perpanjang sekarang untuk memulihkan kontrol.',
          time: 'Hari ini',
          type: 'danger',
          source: 'subscription',
          link: '/petani/subscription',
        });
      } else if (
        subscriptionStatus.status_langganan === 'tenggang' ||
        subscriptionStatus.dalam_masa_tenggang
      ) {
        items.push({
          id: 'sub-grace',
          title: 'Masa Tenggang Langganan',
          description: `Tersisa ${subscriptionStatus.sisa_hari} hari masa tenggang sebelum layanan ditutup.`,
          time: 'Penting',
          type: 'warning',
          source: 'subscription',
          link: '/petani/subscription',
        });
      } else if (subscriptionStatus.sisa_hari <= 3) {
        items.push({
          id: 'sub-near',
          title: 'Langganan Segera Berakhir',
          description: `Sisa masa aktif langganan Anda tersisa ${subscriptionStatus.sisa_hari} hari lagi.`,
          time: 'Penting',
          type: 'warning',
          source: 'subscription',
          link: '/petani/subscription',
        });
      }
    }

    // 2. Alert node offline dari data blok dashboard
    if (dashboard?.blok) {
      for (const b of dashboard.blok) {
        const offlineNodesInBlock = (b.node || []).filter(
          (n) => n.status === 'offline' || (!n.status_online && n.status !== 'online')
        );
        if (offlineNodesInBlock.length > 0) {
          const nodeLabels = offlineNodesInBlock.map((n) => n.kode_perangkat).slice(0, 2).join(', ');
          items.push({
            id: `offline-block-${b.id_blok}`,
            title: `Node Offline (${offlineNodesInBlock.length} Perangkat)`,
            description: nodeLabels
              ? `Perangkat ${nodeLabels} di ${b.nama_blok} tidak merespons telemetri.`
              : `${offlineNodesInBlock.length} node lampu di ${b.nama_blok} terdeteksi offline.`,
            time: 'Terkini',
            type: 'danger',
            source: 'device',
            link: '/kebun/sensors',
          });
        }
      }
    }

    // 3. Notifikasi unread dari notificationService
    const unreadList = notifications.filter((n) => !n.sudah_dibaca);
    unreadList.slice(0, 3).forEach((n) => {
      const type: 'danger' | 'warning' | 'info' =
        n.tipe === 'peringatan' ? 'warning' : 'info';

      items.push({
        id: `notif-${n.id}`,
        title: n.judul,
        description: n.pesan,
        time: n.created_at
          ? new Date(n.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          : 'Baru',
        type,
        source: 'system',
        link: n.tautan || '/petani/notifikasi',
      });
    });

    return items.slice(0, 5);
  }, [subscriptionStatus, dashboard, notifications]);

  const isLoading = isLoadingFarms || (Boolean(activeKebunId) && dashboardQuery.isLoading);

  const refetch = useCallback(async () => {
    await Promise.allSettled([
      dashboardQuery.refetch(),
      subscriptionQuery.refetch(),
      notificationsQuery.refetch(),
      dimmingQuery.refetch(),
      energyQuery.refetch(),
    ]);
  }, [dashboardQuery, subscriptionQuery, notificationsQuery, dimmingQuery, energyQuery]);

  return {
    farms,
    nodes,
    cycles,
    totalFarms,
    totalBlocks,
    totalNodes,
    onlineNodes,
    offlineNodes,
    runningHarvestCycles,
    metricCards,
    recentActivities,
    activeBlocksList,
    subscriptionStatus,
    alertItems,
    dimmingOptions,
    selectedBlockNodeId,
    setSelectedBlockNodeId: handleSelectDimmingNode,
    dimmingChartData,
    isManualDimmingMode,
    manualBrightnessPercent,
    nightlyEnergyData,
    totalNightlyKwh,
    isLoading,
    refetch,
  };
}

export { useDashboard } from './useDashboard';
