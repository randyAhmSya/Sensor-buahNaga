/**
 * Utilitas Murni Pembentuk Konfigurasi YAML IoT dan Resolusi Status Pairing AgroLight
 */

export interface SensorDeviceConfigData {
  nama: string;
  sensor_id: string;
  kode_node: string;
  kode_gateway?: string | null;
  kode_pairing?: string | null;
  base_url?: string;
  interval_detik?: number;
  jumlah_kirim?: number;
  protokol?: 'mqtt' | 'http';
  mqtt_host?: string;
  mqtt_port?: number;
}

export type GatewayPairingState = 'menunggu_pairing' | 'sudah_dipasangkan' | 'tanpa_gateway';

/**
 * Resolusi base_url API untuk komunikasi petani.
 * Memastikan URL selalu mengarah ke endpoint prefix /petani.
 */
export const resolvePetaniBaseUrl = (rawBaseUrl?: string): string => {
  if (rawBaseUrl && rawBaseUrl.trim()) {
    const trimmed = rawBaseUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/petani') ? trimmed : `${trimmed}/petani`;
  }

  // Gunakan import.meta.env jika di lingkungan browser/Vite
  let envBaseUrl = 'http://localhost:8000/api';
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
    envBaseUrl = String(import.meta.env.VITE_API_BASE_URL);
  }

  const normalized = envBaseUrl.trim().replace(/\/+$/, '');
  return normalized.endsWith('/petani') ? normalized : `${normalized}/petani`;
};

/**
 * Status pairing diturunkan murni dari keberadaan gateway dan status gateway.kode_pairing:
 * - Tanpa gateway: jika kode_gateway kosong/null
 * - Menunggu pairing: jika kode_gateway ada dan kode_pairing terisi (string valid)
 * - Sudah dipasangkan: jika kode_gateway ada dan kode_pairing null/kosong
 * (Tidak menggunakan status_koneksi karena status_koneksi berubah mengikuti online/offline telemetri)
 */
export const getGatewayPairingState = (
  kodeGateway?: string | null,
  kodePairing?: string | null
): GatewayPairingState => {
  if (!kodeGateway || !kodeGateway.trim()) {
    return 'tanpa_gateway';
  }
  if (kodePairing && kodePairing.trim()) {
    return 'menunggu_pairing';
  }
  return 'sudah_dipasangkan';
};

/**
 * Membentuk blok YAML item perangkat untuk list devices:
 */
export const generateItemDeviceYaml = (data: SensorDeviceConfigData): string => {
  const pairingState = getGatewayPairingState(data.kode_gateway, data.kode_pairing);
  const cleanNama = (data.nama || 'Blok Lahan').trim();
  const cleanSensorId = (data.sensor_id || '').trim();

  let kodePerangkatLine = '';
  let kodePairingLine = '';

  if (pairingState === 'tanpa_gateway') {
    kodePerangkatLine = '    kode_perangkat: "" # Belum terhubung ke gateway';
    kodePairingLine = '    kode_pairing: "" # Tampil saat gateway dibuat';
  } else if (pairingState === 'menunggu_pairing') {
    kodePerangkatLine = `    kode_perangkat: "${data.kode_gateway!.trim()}"`;
    kodePairingLine = `    kode_pairing: "${data.kode_pairing!.trim()}"`;
  } else {
    // sudah_dipasangkan
    kodePerangkatLine = `    kode_perangkat: "${data.kode_gateway!.trim()}"`;
    kodePairingLine =
      '    kode_pairing: "" # Gateway sudah dipasangkan. Gunakan token yang dicetak perangkat saat pairing. Jika hilang, pairing perlu direset.';
  }

  return `  - nama: "${cleanNama}"
    sensor_id: "${cleanSensorId}"
    token_gateway: "" # Disimpan aman di server, dicetak sekali oleh perangkat saat pairing
${kodePerangkatLine}
${kodePairingLine}`;
};

/**
 * Membentuk seluruh template YAML IoT lengkap siap unduh/salin
 */
export const generateFullIotYaml = (data: SensorDeviceConfigData): string => {
  const baseUrl = resolvePetaniBaseUrl(data.base_url);
  const intervalDetik = data.interval_detik ?? 10;
  const jumlahKirim = data.jumlah_kirim ?? 0;
  const protokol = data.protokol || 'mqtt';
  const mqttHost = data.mqtt_host || '127.0.0.1';
  const mqttPort = data.mqtt_port ?? 1883;

  const itemDeviceYaml = generateItemDeviceYaml(data);

  return `base_url: ${baseUrl}
interval_detik: ${intervalDetik}
jumlah_kirim: ${jumlahKirim} # 0 = kirim terus tanpa henti, atau isi angka buat berhenti otomatis

# protokol buat KIRIM data (telemetri/energi): "http" atau "mqtt"
# pairing SELALU tetap lewat HTTP walaupun protokol ini "mqtt"
protokol: ${protokol}
mqtt_host: ${mqttHost}
mqtt_port: ${mqttPort}

devices:
${itemDeviceYaml}`;
};

