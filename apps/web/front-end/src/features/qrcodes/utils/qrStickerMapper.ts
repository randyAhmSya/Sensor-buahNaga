import type { NodeSensorBackend } from '@/types/node.types';

export interface RegisteredQRItem {
  id: string;
  qrId: string;
  sensorId: string;
  nodeCode: string;
  qrCodeText: string;
  farmName: string;
  blockName: string;
  status: boolean;
  isPrintable: boolean;
  createdAt?: string;
}

export type FarmNameResolver = (blockIdOrKebunId?: string | null) => string | undefined;

/**
 * Fungsi murni untuk memetakan record NodeSensorBackend dari API menjadi RegisteredQRItem.
 * Sumber tunggal kode QR stiker adalah node.qr.teks_kode_qr (tanpa fallback tebakan fiktif).
 * Dilarang menggunakan fallback nama kebun statis atau teks dummy yang menyerupai data nyata.
 */
export function mapNodeToRegisteredQR(
  node: NodeSensorBackend,
  farmNameResolver?: FarmNameResolver
): RegisteredQRItem {
  const sensorId = String(node.id_sensor || node.id || '').trim();
  const nodeCode = String(node.kode_perangkat || '').trim() || 'Node Tanpa Kode';

  // Sumber tunggal teks QR dari backend: node.qr.teks_kode_qr
  const rawQrCodeText = typeof node.qr?.teks_kode_qr === 'string' ? node.qr.teks_kode_qr.trim() : '';
  const hasValidQr = rawQrCodeText.length > 0;
  const qrCodeText = hasValidQr ? rawQrCodeText : 'Belum Terdaftar';

  // ID Database QR
  const qrId = String(node.qr?.id_qr || node.qr_id || '').trim();

  // Status keaktifan QR
  const status = Boolean(node.qr?.status_qr);

  // Resolusi nama kebun (murni dari API relasi blok.kebun atau query lookup)
  const resolvedFarmFromNode = node.blok?.kebun?.nama_kebun?.trim();
  const targetLookupId = node.blok?.kebun_id || node.blok?.id_blok || node.blok_id;
  const resolvedFarmFromLookup = farmNameResolver ? farmNameResolver(targetLookupId) : undefined;
  const farmName = resolvedFarmFromNode || resolvedFarmFromLookup || 'Kebun Tidak Diketahui';

  // Resolusi nama blok lahan (murni dari API relasi blok)
  const blockName = node.blok?.nama_blok?.trim() || 'Blok Tidak Diketahui';

  return {
    id: qrId || sensorId || nodeCode,
    qrId,
    sensorId,
    nodeCode,
    qrCodeText,
    farmName,
    blockName,
    status,
    isPrintable: hasValidQr,
    createdAt: node.created_at,
  };
}

