import { apiClient } from './api';
import type { ApiResponse } from '@/types/api.types';
import type { NodeSensorBackend, CreateNodePayload, UpdateNodePayload } from '@/types/node.types';
import type { SensorNodeItem, SensorSummaryMetrics } from '@/types/sensor.types';
import { nodeService } from './nodeService';
import { farmService } from './farmService';
import { dashboardService } from './dashboardService';
import { mapNodeToSensorItem, type SensorTelemetryReading } from '@/features/sensors/utils/sensorMapper';

export { mapNodeToSensorItem, type SensorTelemetryReading };

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
      let resolvedFarmName: string | undefined = undefined;

      // Jika kebun_id belum disediakan, ambil ID kebun pertama yang valid dari GET /api/petani/kebun
      if (!targetKebunId) {
        const farms = await farmService.getAll();
        if (farms.length > 0) {
          targetKebunId = farms[0].id;
          resolvedFarmName = farms[0].name;
        }
      }

      if (!targetKebunId) {
        return [];
      }

      // Ambil daftar node dan data ringkasan dashboard kebun (satu request) secara paralel
      const [rawNodes, dashboardData] = await Promise.all([
        nodeService.getAll(targetKebunId).catch(() => []),
        dashboardService.getPetaniDashboard(targetKebunId).catch(() => null),
      ]);

      const readingsMap = new Map<string, SensorTelemetryReading>();
      if (dashboardData && Array.isArray(dashboardData.blok)) {
        for (const blk of dashboardData.blok) {
          if (Array.isArray(blk.node)) {
            for (const n of blk.node) {
              const bacaan = (n as unknown as { bacaan_terakhir?: SensorTelemetryReading | null }).bacaan_terakhir;
              if (bacaan) {
                readingsMap.set(n.id_sensor, bacaan);
              }
            }
          }
        }
      }

      if (rawNodes && rawNodes.length > 0) {
        return rawNodes.map((node) => {
          const reading = readingsMap.get(node.id_sensor);
          return mapNodeToSensorItem(node, resolvedFarmName, reading);
        });
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
