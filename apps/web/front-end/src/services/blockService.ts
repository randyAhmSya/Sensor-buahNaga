import { apiClient } from './api';
import type { ApiResponse } from '@/types/api.types';
import type {
  BlokBackend,
  BlockItem,
  BlockDetailFull,
  SensorLogItem,
  BlokStatusLampuResponse,
  BlockStatus,
} from '@/types/block.types';
import { nodeService } from './nodeService';
import { harvestService } from './harvestService';
import { gatewayService } from './gatewayService';
import { scheduleService } from './scheduleService';
import { fetchTelemetri, type ReadSensor } from './telemetryService';
import { fetchLogEnergy, type EnergyLogResponse } from './energyService';
import type { NodeSensorBackend } from '@/types/node.types';

export type { BlokStatusLampuResponse, BlokStatusLampuNode } from '@/types/block.types';

export interface CreateBlockPayload {
  name: string;
  nodeSensor?: string;
  description: string;
  imageUrl?: string;
  status: BlockStatus;
  area?: string;
  harvestEstimate?: string;
  foto?: File;
}

const resolveImageUrl = (url: string | null | undefined): string => {
  if (!url || !url.trim()) {
    return '';
  }
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url;
  }
  const apiBase = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL)
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '')
    : 'http://localhost:8000';
  return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`;
};

export const mapBlokToBlockItem = (blok: BlokBackend): BlockItem => {
  const photoUrl = resolveImageUrl(blok.url_foto);
  const blokId = String(blok.id_blok || blok.id || '').trim();
  const rawEstimate = blok.estimasi_panen || blok.harvest_date || '';
  const cleanEstimate =
    typeof rawEstimate === 'string' &&
    rawEstimate.trim() &&
    rawEstimate !== '--' &&
    rawEstimate !== blok.keterangan
      ? rawEstimate.trim()
      : '';

  const hasNode = Boolean(blok.node_sensor);
  const statusKoneksi = (blok.node_sensor?.status_koneksi || '').toLowerCase();
  const isOnline =
    hasNode &&
    (statusKoneksi === 'aktif' || statusKoneksi === 'online' || statusKoneksi === 'terhubung');

  let status: BlockStatus = 'Belum Terpasang';
  if (hasNode) {
    status = isOnline ? 'Online' : 'Offline';
  }

  return {
    id: blokId,
    name: blok.nama_blok,
    description: blok.keterangan || 'Blok produktif tanaman buah naga',
    area: blok.luas_area ? `${blok.luas_area} m²` : '500 m²',
    nodeSensor: blok.node_sensor ? blok.node_sensor.kode_perangkat : 'Belum Terpasang',
    status,
    imageUrl: photoUrl,
    harvestEstimate: cleanEstimate || 'Belum Dijadwalkan',
  };
};

/**
 * Helper fleksibel untuk mengekstrak array blok dari berbagai variasi respons Laravel REST API
 * (res.data.data, res.data, res.bloks, atau array langsung).
 */
export const extractBlocksArray = (res: unknown): BlokBackend[] => {
  if (!res) return [];
  if (Array.isArray(res)) return res as BlokBackend[];

  const obj = res as Record<string, unknown>;

  // 1. Format: { status: 'success', data: [...] } atau { data: [...] }
  if (Array.isArray(obj.data)) {
    return obj.data as BlokBackend[];
  }

  // 2. Format: { status: 'success', data: { data: [...] } } (Laravel pagination / Resource wrap)
  if (obj.data && typeof obj.data === 'object') {
    const nestedData = (obj.data as Record<string, unknown>).data;
    if (Array.isArray(nestedData)) {
      return nestedData as BlokBackend[];
    }
  }

  // 3. Format: { bloks: [...] } atau { data: { bloks: [...] } }
  if (Array.isArray(obj.bloks)) {
    return obj.bloks as BlokBackend[];
  }
  if (obj.data && typeof obj.data === 'object') {
    const nestedBloks = (obj.data as Record<string, unknown>).bloks;
    if (Array.isArray(nestedBloks)) {
      return nestedBloks as BlokBackend[];
    }
  }

  return [];
};

/**
 * Memeriksa apakah suatu node/blok dimiliki oleh kebun tertentu dengan mencocokkan:
 * - blok.kebun_id
 * - blok.id_kebun
 * - blok.kebun?.id_kebun
 * - blok.kebun?.id
 */
export const isBlokBelongsToFarm = (blok: BlokBackend, farmId: string): boolean => {
  if (!farmId || farmId === 'farm-1') return false;
  const targetId = String(farmId).trim().toLowerCase();

  if (blok.kebun_id && String(blok.kebun_id).trim().toLowerCase() === targetId) return true;
  if (blok.id_kebun && String(blok.id_kebun).trim().toLowerCase() === targetId) return true;
  if (blok.kebun) {
    if (blok.kebun.id_kebun && String(blok.kebun.id_kebun).trim().toLowerCase() === targetId) return true;
    if (blok.kebun.id && String(blok.kebun.id).trim().toLowerCase() === targetId) return true;
  }
  return false;
};

export const blockService = {
  getAll: async (farmId?: string): Promise<BlokBackend[]> => {
    // JANGAN memicu pemanggilan fetch data blok jika ID kebun belum terpilih atau kosong
    if (
      !farmId ||
      typeof farmId !== 'string' ||
      !farmId.trim() ||
      farmId === 'farm-1' ||
      farmId === 'undefined' ||
      farmId === 'null'
    ) {
      return [];
    }
    try {
      const validFarmId = farmId.trim();
      const params = { kebun_id: validFarmId };
      const res = await apiClient.get<unknown>('/petani/blok', { params });
      const rawBlocks = extractBlocksArray(res);

      if (rawBlocks.length > 0) {
        const matched = rawBlocks.filter((b) => isBlokBelongsToFarm(b, validFarmId));
        return matched.length > 0 ? matched : rawBlocks;
      }
    } catch {
      // Tidak ada fallback mock data
    }
    return [];
  },

  getBlocksByFarmId: async (farmId: string): Promise<BlockItem[]> => {
    if (
      !farmId ||
      typeof farmId !== 'string' ||
      !farmId.trim() ||
      farmId === 'farm-1' ||
      farmId === 'undefined' ||
      farmId === 'null'
    ) {
      return [];
    }
    try {
      const cleanFarmId = farmId.trim();
      const rawBlocks = await blockService.getAll(cleanFarmId);

      if (!rawBlocks || rawBlocks.length === 0) {
        return [];
      }

      const filtered = rawBlocks.filter((b) => isBlokBelongsToFarm(b, cleanFarmId));
      const matched = filtered.length > 0 ? filtered : rawBlocks;

      let nodes: NodeSensorBackend[] = [];
      try {
        const resNodes = await nodeService.getAll(cleanFarmId);
        if (Array.isArray(resNodes)) {
          nodes = resNodes;
        }
      } catch {
        nodes = [];
      }

      const blocksWithSensors: BlokBackend[] = matched.map((blok) => {
        const targetBlokId = String(blok.id_blok || blok.id || '').trim();
        const matchedNode = nodes.find((n) => {
          if (!n) return false;
          const nodeBlokId = String(n.blok_id || n.blok?.id_blok || n.blok?.id || '').trim();
          return targetBlokId !== '' && nodeBlokId === targetBlokId;
        });

        if (matchedNode) {
          const rawNode = matchedNode as unknown as Record<string, unknown>;
          const sensorId = String(
            rawNode.id_sensor ||
            rawNode.id ||
            rawNode.id_node ||
            ''
          ).trim();

          return {
            ...blok,
            node_sensor: {
              id_sensor: sensorId,
              id: sensorId || undefined,
              kode_perangkat: matchedNode.kode_perangkat,
              status_koneksi: matchedNode.status_koneksi,
              terakhir_terlihat: matchedNode.terakhir_terlihat ?? undefined,
            },
          };
        }
        return blok;
      });

      return blocksWithSensors.map(mapBlokToBlockItem);
    } catch {
      // Tidak ada fallback mock data
    }
    return [];
  },

  getById: async (farmId: string, blockId: string): Promise<BlockDetailFull | null> => {
    if (!blockId || blockId === 'blk-1') return null;
    try {
      const cleanBlockId = blockId.trim();
      const res = await apiClient.get<unknown>(`/petani/blok/${cleanBlockId}`);
      
      let blok: BlokBackend | null = null;
      if (res && typeof res === 'object') {
        const obj = res as Record<string, unknown>;
        if (obj.id_blok || obj.nama_blok) {
          blok = obj as unknown as BlokBackend;
        } else if (obj.data && typeof obj.data === 'object') {
          const dataObj = obj.data as Record<string, unknown>;
          if (dataObj.id_blok || dataObj.nama_blok) {
            blok = dataObj as unknown as BlokBackend;
          } else if (dataObj.data && typeof dataObj.data === 'object') {
            blok = dataObj.data as unknown as BlokBackend;
          }
        }
      }

      if (!blok) return null;

      const photoUrl = resolveImageUrl(blok.url_foto);
      const blokObj = blok as unknown as Record<string, unknown>;
      const rawEstimate = blokObj.estimasi_panen || blokObj.harvest_date || blokObj.estimasiPanen || '';
      const cleanEstimate =
        typeof rawEstimate === 'string' &&
        rawEstimate.trim() &&
        rawEstimate !== '--' &&
        rawEstimate !== blok.keterangan
          ? rawEstimate.trim()
          : '';

      let targetFarmId =
        blok.kebun_id ||
        blok.id_kebun ||
        blok.kebun?.id_kebun ||
        blok.kebun?.id ||
        (farmId && farmId !== 'farm-1' && farmId !== 'undefined' ? farmId.trim() : '') ||
        '';

      let farmName = blok.kebun?.nama_kebun || '';

      if (!targetFarmId) {
        try {
          const resKebun = await apiClient.get<unknown>('/petani/kebun');
          let kebunList: Record<string, unknown>[] = [];
          if (resKebun && typeof resKebun === 'object') {
            const r = resKebun as Record<string, unknown>;
            if (Array.isArray(r.data)) kebunList = r.data as Record<string, unknown>[];
            else if (Array.isArray(resKebun)) kebunList = resKebun as Record<string, unknown>[];
          }
          if (kebunList.length > 0) {
            targetFarmId = String(kebunList[0].id_kebun || kebunList[0].id || '');
            if (!farmName) farmName = String(kebunList[0].nama_kebun || '');
          }
        } catch {
          // ignore
        }
      }
      if (!farmName) farmName = 'Kebun Buah Naga';

      // 1. Ambil daftar node sensor dari kebun terkait via GET /api/petani/node?kebun_id=${kebunId}
      let nodes: NodeSensorBackend[] = [];
      if (targetFarmId) {
        try {
          const resNodes = await nodeService.getAll(targetFarmId);
          if (Array.isArray(resNodes)) {
            nodes = resNodes;
          }
        } catch {
          nodes = [];
        }
      }
      // Fallback periksa semua kebun jika node belum ditemukan
      if (nodes.length === 0) {
        try {
          const resKebun = await apiClient.get<unknown>('/petani/kebun');
          let kebunList: Record<string, unknown>[] = [];
          if (resKebun && typeof resKebun === 'object') {
            const r = resKebun as Record<string, unknown>;
            if (Array.isArray(r.data)) kebunList = r.data as Record<string, unknown>[];
            else if (Array.isArray(resKebun)) kebunList = resKebun as Record<string, unknown>[];
          }
          for (const k of kebunList) {
            const kId = String(k.id_kebun || k.id || '');
            if (kId && kId !== targetFarmId) {
              try {
                const farmNodes = await nodeService.getAll(kId);
                if (Array.isArray(farmNodes)) {
                  nodes.push(...farmNodes);
                }
              } catch {
                // abaikan error kebun lain
              }
            }
          }
        } catch {
          // abaikan error
        }
      }

      // 2. Cari apakah ada node yang terpasang pada blok ini:
      const activeNode = Array.isArray(nodes)
        ? nodes.find((n) => {
            const raw = n as unknown as Record<string, unknown>;
            const bId = cleanBlockId;
            return (
              (n.blok_id && String(n.blok_id).trim() === bId) ||
              (raw.id_blok && String(raw.id_blok).trim() === bId) ||
              (raw.block_id && String(raw.block_id).trim() === bId) ||
              (n.blok?.id_blok && String(n.blok.id_blok).trim() === bId) ||
              (n.blok?.id && String(n.blok.id).trim() === bId)
            );
          })
        : undefined;

      const deviceId =
        activeNode?.kode_perangkat ||
        blok.node_sensor?.kode_perangkat ||
        'Belum Terpasang';

      const isNodeConnected = deviceId !== 'Belum Terpasang';
      const nodeStatusRaw = String(
        activeNode?.status_koneksi ||
        blok.node_sensor?.status_koneksi ||
        ''
      ).toLowerCase();
      const isOnline =
        isNodeConnected &&
        (nodeStatusRaw === 'aktif' || nodeStatusRaw === 'online' || nodeStatusRaw === 'terhubung');

      let gateway =
        activeNode?.gateway?.kode_perangkat ||
        (activeNode as unknown as Record<string, unknown>)?.gateway_kode as string | undefined;

      if (!gateway && activeNode?.gateway_id) {
        try {
          const gw = await gatewayService.getById(activeNode.gateway_id);
          if (gw?.kode_perangkat) {
            gateway = gw.kode_perangkat;
          }
        } catch {
          // ignore
        }
      }
      if (!gateway && activeNode?.gateway_id) {
        gateway = `GW-${activeNode.gateway_id.substring(0, 4).toUpperCase()}`;
      }
      if (!gateway) {
        gateway = 'GW-01';
      }

      const lastSeen = activeNode?.terakhir_terlihat
        ? new Date(activeNode.terakhir_terlihat).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        : 'Baru saja';

      // 3. Ambil siklus panen aktif (status_siklus === "BERJALAN")
      const cycles = await harvestService.getHarvestCycles(cleanBlockId).catch(() => []);
      const activeCycle = cycles.find((c) => {
        const st = String(c.status_siklus || '').toUpperCase();
        return st === 'BERJALAN' || st === 'AKTIF' || st === 'SEDANG BERJALAN';
      });

      const cycleStatus = activeCycle
        ? 'Sedang Berjalan'
        : cycles.length > 0
        ? 'Selesai'
        : 'Belum Dimulai';
      const lightingStart = activeCycle?.tanggal_penyinaran || '-';
      const floweringTarget = activeCycle
        ? `${activeCycle.target_hari_berbunga} Hari`
        : '-';
      const harvestEstimate = activeCycle
        ? (activeCycle.estimasi_tanggal_panen || cleanEstimate || 'Belum Dijadwalkan')
        : (cleanEstimate || 'Belum Dijadwalkan');

      const cycleHistory = cycles.map((c) => ({
        id: c.id_siklus_panen ? c.id_siklus_panen.substring(0, 8) : 'Siklus',
        startDate: c.tanggal_penyinaran || '-',
        actualHarvestDate: c.tanggal_panen || c.estimasi_tanggal_panen || '-',
        durationDays: (c.target_hari_berbunga || 20) + (c.target_hari_panen_setelah_bunga || 30),
        status: (String(c.status_siklus).toUpperCase() === 'SELESAI' ? 'Selesai' : 'Berjalan') as 'Selesai' | 'Berjalan',
      }));

      // 4. Ambil jadwal pencahayaan aktif dari backend
      let lightingSchedule = {
        activeCycle: activeCycle ? 'Sedang Berjalan' : 'Belum Ada Jadwal',
        intensity: isOnline ? '80%' : '0%',
      };

      try {
        const sensorId = activeNode?.id_sensor || blok.node_sensor?.id_sensor;
        if (sensorId) {
          const activeSched = await scheduleService.getActive(sensorId);
          if (activeSched && (activeSched.status_aktif === true || activeSched.status_aktif === 1)) {
            const startStr = activeSched.jam_mulai || activeSched.jam_mulai_nyala || '18:00';
            const endStr = activeSched.jam_selesai || activeSched.jam_akhir_nyala || '06:00';
            lightingSchedule = {
              activeCycle: activeSched.nama_jadwal || `${startStr.substring(0, 5)} - ${endStr.substring(0, 5)}`,
              intensity: `${activeSched.instensitas_cahaya ?? activeSched.intensitas_cahaya ?? 80}%`,
            };
          }
        }
        if (lightingSchedule.activeCycle === 'Belum Ada Jadwal' && targetFarmId) {
          const farmScheds = await scheduleService.getAll({ kebun_id: targetFarmId });
          const activeFarmSched = farmScheds.find((s) => s.status_aktif === true || s.status_aktif === 1);
          if (activeFarmSched) {
            const startStr = activeFarmSched.jam_mulai || activeFarmSched.jam_mulai_nyala || '18:00';
            const endStr = activeFarmSched.jam_selesai || activeFarmSched.jam_akhir_nyala || '06:00';
            lightingSchedule = {
              activeCycle: activeFarmSched.nama_jadwal || `${startStr.substring(0, 5)} - ${endStr.substring(0, 5)}`,
              intensity: `${activeFarmSched.instensitas_cahaya ?? activeFarmSched.intensitas_cahaya ?? 80}%`,
            };
          }
        }
      } catch {
        // Fallback default
      }

      // 5. Ambil data riil telemetri dan log energi jika sensor terpasang
      let telemetriList: ReadSensor[] = [];
      let energyData: EnergyLogResponse = { total_kwh: 0, riwayat: [] };
      const sensorId = activeNode?.id_sensor || blok.node_sensor?.id_sensor;

      if (sensorId && sensorId.trim() && sensorId !== 'Belum Terpasang') {
        try {
          const [resTelemetri, resEnergy] = await Promise.all([
            fetchTelemetri(sensorId, 100).catch(() => []),
            fetchLogEnergy(sensorId, 100).catch(() => ({ total_kwh: 0, riwayat: [] })),
          ]);
          telemetriList = resTelemetri;
          energyData = resEnergy;
        } catch {
          // ignore
        }
      }

      // Petakan log sensor dari pembacaan telemetri riil
      const sensorLogs: SensorLogItem[] = telemetriList.map((t, idx) => {
        const dt = t.dicatat_pada ? new Date(t.dicatat_pada) : null;
        const timeStr = dt && !isNaN(dt.getTime())
          ? dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          : (t.dicatat_pada || 'Baru saja');
        return {
          id: t.id || `${sensorId}-${idx}`,
          timestamp: timeStr,
          lux: `${t.nilai_lux ?? t.lux ?? 0} lx`,
          temperature: `${t.suhu ?? t.temperature ?? 0}°C`,
          humidity: `${t.kelembapan ?? t.humidity ?? '--'}%`,
          battery: `${t.baterai ?? t.battery ?? 100}%`,
          signalQuality: t.kualitas_sinyal || '-65 dBm',
          gatewayStatus: 'Online / Synced',
        };
      });

      const latestTelemetry = telemetriList.length > 0 ? telemetriList[telemetriList.length - 1] : null;
      const displayLux = latestTelemetry
        ? `${latestTelemetry.nilai_lux ?? latestTelemetry.lux ?? 0} lx`
        : (isOnline ? '0 lx' : '0 lx');
      const hasActualTemp = Boolean(
        latestTelemetry &&
        ((latestTelemetry.suhu !== undefined && latestTelemetry.suhu !== null) ||
         (latestTelemetry.temperature !== undefined && latestTelemetry.temperature !== null))
      );
      const displayTemp = hasActualTemp
        ? `${latestTelemetry?.suhu ?? latestTelemetry?.temperature}°C`
        : '';
      const displayLastSeen = latestTelemetry?.dicatat_pada
        ? new Date(latestTelemetry.dicatat_pada).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        : lastSeen;

      return {
        id: String(blok.id_blok || blok.id || cleanBlockId || '').trim(),
        farmId: targetFarmId,
        farmName,
        name: blok.nama_blok,
        description: blok.keterangan || '',
        area: blok.luas_area ? `${blok.luas_area} m²` : '',
        bannerUrl: photoUrl,
        deviceId,
        nodeSensorId: sensorId,
        deviceStatus: (isOnline ? 'Terhubung' : 'Offline') as 'Online' | 'Offline',
        currentLux: displayLux,
        temperature: displayTemp,
        gateway,
        lastSeen: displayLastSeen,
        lightingSchedule,
        energyConsumption: {
          kwh: energyData.total_kwh,
          period: 'Bulan Ini',
        },
        harvestCycle: {
          status: cycleStatus,
          lightingStart,
          floweringTarget,
          harvestEstimate,
        },
        cycleHistory,
        sensorLogs,
      };
    } catch {
      // Tidak ada fallback ke mock
    }
    return null;
  },

  create: async (
    farmId: string,
    payload: CreateBlockPayload
  ): Promise<{ success: boolean; id: string }> => {
    const formData = new FormData();
    formData.append('kebun_id', farmId);
    formData.append('nama_blok', payload.name);
    if (payload.description) formData.append('keterangan', payload.description);
    if (payload.area) {
      const numericArea = parseFloat(payload.area.replace(/[^\d.]/g, '')) || 0;
      formData.append('luas_area', String(numericArea));
    }
    if (payload.foto) {
      formData.append('foto', payload.foto);
    }
    if (payload.nodeSensor && payload.nodeSensor.trim()) {
      formData.append('sensor_id', payload.nodeSensor);
      formData.append('node_id', payload.nodeSensor);
    }
    if (payload.status !== undefined) {
      formData.append('status', payload.status);
    }

    const res = await apiClient.post<ApiResponse<BlokBackend>>('/petani/blok', formData);
    const newBlockId = res.data.id_blok;


    return { success: true, id: newBlockId };
  },

  update: async (
    _farmId: string,
    blockId: string,
    payload: Partial<CreateBlockPayload>
  ): Promise<{ success: boolean }> => {
    const formData = new FormData();
    if (payload.name) formData.append('nama_blok', payload.name);
    if (payload.description) formData.append('keterangan', payload.description);
    if (payload.area) {
      const numericArea = parseFloat(payload.area.replace(/[^\d.]/g, '')) || 0;
      formData.append('luas_area', String(numericArea));
    }
    if (payload.foto) {
      formData.append('foto', payload.foto);
    }
    if (payload.nodeSensor !== undefined) {
      formData.append('sensor_id', payload.nodeSensor || '');
      formData.append('node_id', payload.nodeSensor || '');
    }
    if (payload.status !== undefined) {
      formData.append('status', payload.status);
    }
    formData.append('_method', 'PUT');

    await apiClient.post<ApiResponse<BlokBackend>>(`/petani/blok/${blockId}`, formData);


    return { success: true };
  },

  delete: async (blockId: string): Promise<{ success: boolean }> => {
    await apiClient.delete<ApiResponse<null>>(`/petani/blok/${blockId}`);
    return { success: true };
  },

  /**
   * Mengambil status lampu per blok (jumlah lampu, online, offline, batas waktu, detail node)
   * Endpoint: GET /api/petani/blok/{id}/status-lampu
   */
  getStatusLampu: async (blockId: string): Promise<BlokStatusLampuResponse | null> => {
    if (!blockId || blockId === 'blk-1') return null;
    try {
      const res = await apiClient.get<ApiResponse<BlokStatusLampuResponse>>(`/petani/blok/${blockId.trim()}/status-lampu`);
      return res.data;
    } catch {
      return null;
    }
  },

  getSensorLogs: async (
    _blockId: string,
    _filterRange?: string
  ): Promise<SensorLogItem[]> => {
    return [];
  },
};
