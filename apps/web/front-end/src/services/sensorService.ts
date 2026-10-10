import { apiClient } from './api';
import type { ApiResponse } from '@/types/api.types';
import type { NodeSensorBackend, CreateNodePayload, UpdateNodePayload } from '@/types/node.types';
import type { SensorNodeItem, SensorSummaryMetrics } from '@/types/sensor.types';
import { nodeService } from './nodeService';

import { farmService } from './farmService';
import { getEntityId } from '@/utils/normalize';

export const mapNodeToSensorItem = (node: NodeSensorBackend, fallbackFarmName?: string): SensorNodeItem => {
  const isOnline =
    node.status_koneksi?.toLowerCase() === 'aktif' ||
    node.status_koneksi?.toLowerCase() === 'online';

  return {
    id: getEntityId(node) || node.id_sensor,
    nodeCode: node.kode_perangkat,
    farmId: node.blok?.kebun_id || '',
    farmName: fallbackFarmName || node.blok?.kebun?.nama_kebun || 'Kebun Buah Naga',
    blockId: node.blok_id || '',
    blockName: node.blok?.nama_blok || 'Belum Terhubung Blok',
    gatewayId: node.gateway_id || node.gateway?.id_gateway || null,
    gatewayCode: node.gateway?.kode_perangkat || null,
    gatewayStatus: node.gateway?.status_koneksi || null,
    tipeSensor: node.tipe_sensor || 'lux_suhu',
    status: isOnline ? 'Aktif' : 'Nonaktif',
    luxLevel: isOnline ? 120 : 0,
    temperature: 28.5,
    lastSeen: node.terakhir_terlihat
      ? new Date(node.terakhir_terlihat).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      : 'Baru saja',
    sparklineData: isOnline ? [85, 90, 110, 115, 120, 118, 120] : [0, 0, 0, 0, 0, 0, 0],
  };
};

export const sensorService = {
  getSummary: async (sensorsList?: SensorNodeItem[]): Promise<SensorSummaryMetrics> => {
    try {
      const nodes = sensorsList || (await sensorService.getAll());
      const totalNodes = nodes.length;
      const onlineNodes = nodes.filter((n) => n.status === 'Aktif' || n.status === 'Online').length;
      const offlineNodes = totalNodes - onlineNodes;
      return { totalNodes, onlineNodes, offlineNodes };
    } catch {
      return { totalNodes: 0, onlineNodes: 0, offlineNodes: 0 };
    }
  },

  getAll: async (kebunId?: string): Promise<SensorNodeItem[]> => {
    try {
      let targetKebunId = kebunId && kebunId !== 'Semua Kebun' ? kebunId.trim() : undefined;
      // Jika kebun_id belum disediakan, ambil ID kebun pertama yang valid dari GET /api/petani/kebun
      if (!targetKebunId) {
        const farms = await farmService.getAll();
        if (farms.length > 0) {
          targetKebunId = farms[0].id;
        }
      }

      if (!targetKebunId) {
        return [];
      }

      const rawNodes = await nodeService.getAll(targetKebunId);
      if (rawNodes && rawNodes.length > 0) {
        return rawNodes.map((node) => mapNodeToSensorItem(node));
      }
      return [];
    } catch {
      return [];
    }
  },

  getByNodeCode: async (nodeCode: string): Promise<SensorNodeItem | undefined> => {
    const all = await sensorService.getAll();
    return all.find((s) => s.nodeCode.toLowerCase() === nodeCode.toLowerCase());
  },

  create: async (payload: CreateNodePayload): Promise<ApiResponse<NodeSensorBackend>> => {
    return await nodeService.create(payload);
  },

  update: async (id: string, payload: UpdateNodePayload): Promise<ApiResponse<NodeSensorBackend>> => {
    return await nodeService.update(id, payload);
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    return await nodeService.delete(id);
  },

  generateNewQr: async (sensorId: string): Promise<ApiResponse<NodeSensorBackend>> => {
    return await apiClient.post<ApiResponse<NodeSensorBackend>>(`/petani/node/${sensorId}/generate-qr`);
  },
};
