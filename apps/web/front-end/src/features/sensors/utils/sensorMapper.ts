export interface SensorTelemetryReading {
  nilai_lux: number | null;
  suhu: number | null;
  dicatat_pada: string | null;
}

export interface NodeSensorInput {
  id_sensor?: string;
  id?: string;
  kode_perangkat: string;
  blok_id?: string | null;
  blok?: {
    id_blok?: string;
    nama_blok?: string;
    kebun_id?: string;
    kebun?: {
      id_kebun?: string;
      nama_kebun?: string;
    };
  } | null;
  gateway_id?: string | null;
  gateway?: {
    id_gateway?: string;
    kode_perangkat?: string;
    status_koneksi?: string | null;
    kode_pairing?: string | null;
    token_gateway?: string | null;
  } | null;
  qr?: {
    teks_kode_qr?: string;
  } | null;
  kode_pairing?: string | null;
  token_perangkat?: string | null;
  tipe_sensor?: string;
  status_koneksi?: string;
  terakhir_terlihat?: string | null;
  jumlah_lampu?: number | null;
  watt_per_lampu?: number | null;
  watt_terpasang?: number | null;
}

export interface MappedSensorItem {
  id: string;
  nodeCode: string;
  farmId: string;
  farmName: string;
  blockId: string;
  blockName: string;
  gatewayId: string | null;
  gatewayCode: string | null;
  gatewayStatus: string | null;
  kodePairing: string | null;
  pairingCode: string | null;
  tokenGateway: string | null;
  tipeSensor: string;
  status: string;
  luxLevel: number | null;
  temperature: number | null;
  lastSeen: string;
  sparklineData: number[];
  qrCode: string;
  jumlah_lampu: number;
  watt_per_lampu: number | null;
  watt_terpasang: number | null;
}

/**
 * Pemetaan murni dari data NodeSensor backend ke MappedSensorItem UI.
 * Tidak menggunakan nilai dummy: lux dan suhu bernilai null jika tidak ada bacaan riil.
 */
export const mapNodeToSensorItem = (
  node: NodeSensorInput,
  fallbackFarmName?: string,
  reading?: SensorTelemetryReading | null
): MappedSensorItem => {
  const rawStatus = (node.status_koneksi || '').toLowerCase();
  const isOnline = rawStatus === 'aktif' || rawStatus === 'online';

  const luxLevel =
    reading?.nilai_lux !== undefined && reading?.nilai_lux !== null
      ? reading.nilai_lux
      : null;

  const temperature =
    reading?.suhu !== undefined && reading?.suhu !== null
      ? reading.suhu
      : null;

  const lastSeen = reading?.dicatat_pada
    ? new Date(reading.dicatat_pada).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    : node.terakhir_terlihat
    ? new Date(node.terakhir_terlihat).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    : 'Belum ada data';

  const id = node.id || node.id_sensor || '';

  return {
    id,
    nodeCode: node.kode_perangkat,
    farmId: node.blok?.kebun_id || '',
    farmName: fallbackFarmName || node.blok?.kebun?.nama_kebun || '',
    blockId: node.blok_id || '',
    blockName: node.blok?.nama_blok || 'Belum Terhubung Blok',
    gatewayId: node.gateway_id || node.gateway?.id_gateway || null,
    gatewayCode: node.gateway?.kode_perangkat || null,
    gatewayStatus: node.gateway?.status_koneksi || null,
    kodePairing: node.gateway?.kode_pairing || node.kode_pairing || null,
    pairingCode: node.gateway?.kode_pairing || node.kode_pairing || null,
    tokenGateway: node.gateway?.token_gateway || node.token_perangkat || null,
    tipeSensor: node.tipe_sensor || 'lux_suhu',
    status: isOnline ? 'Aktif' : (node.terakhir_terlihat ? 'Nonaktif' : 'belum_pernah_terlihat'),
    luxLevel,
    temperature,
    lastSeen,
    sparklineData: [],
    qrCode: node.qr?.teks_kode_qr || '',
    jumlah_lampu: node.jumlah_lampu ?? 1,
    watt_per_lampu: node.watt_per_lampu ?? null,
    watt_terpasang:
      node.watt_terpasang ??
      (node.watt_per_lampu !== null && node.watt_per_lampu !== undefined
        ? Math.round((node.jumlah_lampu ?? 1) * node.watt_per_lampu * 100) / 100
        : null),
  };
};
