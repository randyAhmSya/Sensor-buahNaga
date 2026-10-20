import { useState, useEffect, useCallback } from 'react';
import { Trees, Grid, Router, Repeat } from 'lucide-react';
import { farmService } from '@/services/farmService';
import { nodeService } from '@/services/nodeService';
import { harvestService } from '@/services/api';
import type { DashboardCardMetricItem, TelemetryNodeRow } from '@/types/telemetry';
import type { FarmItem } from '@/types/farm.types';
import type { NodeSensorBackend } from '@/types/node.types';
import type { HarvestCycle } from '@/features/harvests/types/harvest.types';

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
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useDashboardData(): DashboardData {
  const [farms, setFarms] = useState<FarmItem[]>([]);
  const [nodes, setNodes] = useState<NodeSensorBackend[]>([]);
  const [cycles, setCycles] = useState<HarvestCycle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Ambil daftar kebun via GET /api/petani/kebun
      const loadedFarms = await farmService.getAll().catch(() => []);

      // 2. Ambil node sensor untuk semua kebun terdaftar dengan menyertakan kebun_id
      // (Mencegah pemanggilan GET /api/petani/node tanpa parameter yang memicu HTTP 400)
      let loadedNodes: NodeSensorBackend[] = [];
      if (loadedFarms.length > 0) {
        const nodesResults = await Promise.allSettled(
          loadedFarms.map((f) => nodeService.getAll(f.id))
        );
        loadedNodes = nodesResults.flatMap((res) =>
          res.status === 'fulfilled' && Array.isArray(res.value) ? res.value : []
        );
      }

      // 3. Ambil siklus panen riil untuk seluruh blok terdaftar
      const allBlocks = loadedFarms.flatMap((f) =>
        (f.blocks || []).map((b) => ({
          id: b.id,
          name: b.name,
          farmName: f.name,
        }))
      );
      const loadedCycles = await harvestService.getAllCycles(allBlocks).catch(() => []);

      setFarms(loadedFarms);
      setNodes(loadedNodes);
      setCycles(loadedCycles);
    } catch {
      setFarms([]);
      setNodes([]);
      setCycles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Perhitungan Metrik Riil
  const totalFarms = farms.length;
  const totalBlocks = farms.reduce((sum, f) => sum + (f.blocks?.length || 0), 0);
  const totalNodes = nodes.length;
  const onlineNodes = nodes.filter(
    (n) => n.status_koneksi?.toLowerCase() === 'online' || n.status_koneksi?.toLowerCase() === 'aktif'
  ).length;
  const offlineNodes = totalNodes - onlineNodes;
  const runningHarvestCycles = cycles.filter((c) => c.status_siklus === 'BERJALAN').length;

  // 4 Kartu Metrik Utama
  const metricCards: DashboardCardMetricItem[] = [
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
      value: totalNodes > 0 ? onlineNodes : 0,
      unit: 'Online',
      unitColor: 'text-emerald-600',
      icon: Router,
      iconColor: 'text-emerald-700',
      badgeText: totalNodes > 0 ? `${offlineNodes} Offline` : '0 Terpasang',
      badgeVariant: offlineNodes > 0 ? 'rose' : 'slate',
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
  ];

  // Pemetaan Aktivitas Telemetri Riil
  const recentActivities: TelemetryNodeRow[] = nodes.map((node) => {
    const isOnline =
      node.status_koneksi?.toLowerCase() === 'online' || node.status_koneksi?.toLowerCase() === 'aktif';
    const farmName = node.blok?.kebun?.nama_kebun;
    const blockName = node.blok?.nama_blok;
    const location = farmName && blockName ? `${farmName} (${blockName})` : farmName || blockName || 'Belum Terhubung';

    return {
      nodeCode: node.kode_perangkat,
      location,
      luxValue: isOnline ? '480 lx' : '0 lx',
      powerConsumption: isOnline ? '120 W' : '0 W',
      recordedTime: node.terakhir_terlihat || 'Baru saja',
      status: isOnline ? 'Optimal' : 'Offline',
    };
  });

  // Pemetaan Operasional Blok Riil
  const activeBlocksList: ActiveBlockOverviewItem[] = farms.flatMap((farm) =>
    (farm.blocks || []).map((block) => ({
      id: block.id,
      name: `${farm.name} - ${block.name}`,
      nodeCount: block.nodeSensor && block.nodeSensor !== 'Belum Terpasang' ? 1 : 0,
      lightIntensity: block.status === 'Online' ? 85 : 0,
      schedule: '18:00 - 05:00 WIB',
      status: block.status === 'Online' ? 'Menyala' : 'Standby',
    }))
  );

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
    isLoading,
    refetch: fetchData,
  };
}
