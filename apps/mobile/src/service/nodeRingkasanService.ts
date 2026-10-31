import apiClient from "./apiClient";
import type { BackendNodeRingkasanDTO } from "@/types/api/nodeRingkasan.dto";

/**
 * Mengambil ringkasan terpadu node sensor dari API Laravel:
 * GET /api/petani/node/{id_sensor}/ringkasan
 */
export async function fetchNodeRingkasan(
  idSensor: string,
): Promise<BackendNodeRingkasanDTO> {
  const trimmed = idSensor.trim();
  if (!trimmed) {
    throw new Error("ID Sensor tidak boleh kosong");
  }

  const res = await apiClient.get<{
    status: string;
    pesan?: string;
    data: BackendNodeRingkasanDTO;
  }>(`/petani/node/${encodeURIComponent(trimmed)}/ringkasan`);

  return res.data.data;
}

