import apiClient from "./apiClient";
import type { NodeDetail } from "@/constant/NodeDetails";
import type { BackendSensorDTO, BackendReadSensorDTO } from "@/types/api";
import { mapToNodeDetail } from "./mappers/nodeDetailMapper";

/**
 * Mengonsumsi data detail node dari API Laravel:
 * - GET /api/petani/node/{id}
 * - GET /api/petani/telemetri?sensor_id=...
 */
export async function fetchNodeDetail(id: string): Promise<NodeDetail | null> {
  const trimmedId = id.trim();
  if (!trimmedId) return null;

  const nodeRes = await apiClient.get<{
    status: string;
    data: BackendSensorDTO;
  }>(`/petani/node/${encodeURIComponent(trimmedId)}`);

  const backendNode = nodeRes.data?.data;
  if (!backendNode) return null;

  let latestTelemetry: BackendReadSensorDTO | undefined = undefined;
  try {
    const teleRes = await apiClient.get<{
      status: string;
      data: BackendReadSensorDTO[];
    }>("/petani/telemetri", {
      params: { sensor_id: backendNode.id_sensor, limit: 1 },
    });
    latestTelemetry = teleRes.data?.data?.[0];
  } catch {
    // Abaikan jika log telemetri belum tersedia
  }

  return mapToNodeDetail(backendNode, latestTelemetry);
}
