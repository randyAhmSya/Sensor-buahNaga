import type { GatewayBackend } from '../../../types/gateway.types.ts';
import { KODE_PERANGKAT_REGEX } from '../../../schemas/deviceCode.schema.ts';

/**
 * Membentuk kode gateway deterministik berbasis kode node sensor.
 * Menjamin hasil selalu cocok dengan KODE_PERANGKAT_REGEX (/^[A-Za-z0-9_-]{3,50}$/):
 * - Prefix 'GTW-' (4 karakter)
 * - Bagian kode node dipotong maksimal 46 karakter (sehingga total panjang <= 50)
 * - Karakter non-alfanumerik/strip/garis bawah dibersihkan
 */
export function buildGatewayCode(nodeCode: string): string {
  const cleanNode = (nodeCode || '')
    .trim()
    .replace(/[^A-Za-z0-9_-]/g, '')
    .toUpperCase();

  const safeNodePart = cleanNode.slice(0, 46);
  const candidate = safeNodePart.length > 0 ? `GTW-${safeNodePart}` : 'GTW-DEFAULT';

  // Fallback pengaman jika kandidat di bawah 3 karakter
  if (candidate.length < 3) {
    return 'GTW-01';
  }

  // Jika melebihi 50 karakter (teoretis tidak mungkin karena 4 + 46 = 50), potong tepat 50
  const finalCode = candidate.slice(0, 50);

  // Verifikasi akhir dengan regex
  if (!KODE_PERANGKAT_REGEX.test(finalCode)) {
    return 'GTW-DEFAULT';
  }

  return finalCode;
}

/**
 * Menentukan apakah status koneksi gateway berstatus terhubung/aktif
 */
function isGatewayConnected(status?: string | null): boolean {
  if (!status) return false;
  const s = status.toLowerCase();
  return s === 'terhubung' || s === 'online' || s === 'aktif';
}

/**
 * Memilih satu gateway yang sah untuk suatu kebun secara deterministik.
 * Jika kebun memiliki lebih dari 1 gateway (data legasi sebelum aturan tunggal):
 * 1. Prioritas 1: Gateway berstatus terhubung / online / aktif lebih diutamakan
 * 2. Prioritas 2: Paling lama dibuat (created_at paling awal / ascending)
 * 3. Prioritas 3: ID gateway / kode perangkat secara alfabetis ascending (tie-breaker stabil)
 */
export function resolveKebunGateway(
  gateways: GatewayBackend[],
  kebunId?: string,
  farmBlocks?: string[]
): GatewayBackend | null {
  if (!gateways || gateways.length === 0) return null;

  const cleanKebunId = kebunId?.trim();
  const candidateBlocks = farmBlocks ? farmBlocks.map((b) => String(b).trim()) : [];

  // Saring gateway yang terikat pada kebun bersangkutan
  const candidates = gateways.filter((gw) => {
    // a. Cek kebun_id pada relasi blok
    const gwKebunId =
      gw.blok?.kebun_id ??
      gw.blok?.kebun?.id_kebun ??
      (gw as unknown as { kebun_id?: string }).kebun_id;

    if (cleanKebunId && gwKebunId && String(gwKebunId).trim() === cleanKebunId) {
      return true;
    }

    // b. Cek apakah blok_id gateway termasuk dalam daftar blok kebun
    if (candidateBlocks.length > 0 && gw.blok_id) {
      if (candidateBlocks.includes(String(gw.blok_id).trim())) {
        return true;
      }
    }

    // c. Jika filter kebunId & farmBlocks tidak disediakan, asumsikan daftar telah diambil per-kebun
    if (!cleanKebunId && candidateBlocks.length === 0) {
      return true;
    }

    return false;
  });

  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  // Urutkan secara deterministik
  return [...candidates].sort((a, b) => {
    const isAConnected = isGatewayConnected(a.status_koneksi);
    const isBConnected = isGatewayConnected(b.status_koneksi);
    if (isAConnected !== isBConnected) {
      return isAConnected ? -1 : 1; // terhubung lebih dahulu
    }

    const timeA = a.created_at ? new Date(a.created_at).getTime() : Infinity;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : Infinity;
    if (timeA !== timeB) {
      return timeA - timeB; // paling lama dibuat (earliest timestamp)
    }

    const idA = a.id_gateway || a.id || a.kode_perangkat;
    const idB = b.id_gateway || b.id || b.kode_perangkat;
    return idA.localeCompare(idB);
  })[0];
}

export interface ExtractedErrorDetails {
  status?: number;
  message: string;
  pesan: string;
  errors?: Record<string, string[]>;
}

/**
 * Ekstraksi detail status dan pesan error API secara aman tanpa penggunaan 'any'
 */
export function extractErrorDetails(error: unknown): ExtractedErrorDetails {
  if (!error || typeof error !== 'object') {
    return { message: String(error || ''), pesan: '' };
  }

  const errObj = error as Record<string, unknown>;
  const responseData = (errObj.response as Record<string, unknown>)?.data as
    | Record<string, unknown>
    | undefined;

  const status =
    (typeof errObj.status === 'number' ? errObj.status : undefined) ??
    (typeof (errObj.response as Record<string, unknown>)?.status === 'number'
      ? ((errObj.response as Record<string, unknown>).status as number)
      : undefined);

  const errors =
    (errObj.errors as Record<string, string[]> | undefined) ??
    (responseData?.errors as Record<string, string[]> | undefined);

  const message = String(
    responseData?.message ||
    errObj.message ||
    responseData?.pesan ||
    errObj.pesan ||
    ''
  );

  const pesan = String(
    responseData?.pesan ||
    errObj.pesan ||
    ''
  );

  return { status, message, pesan, errors };
}

/**
 * Mendeteksi apakah error 422 merupakan galat "Kebun ini sudah memiliki gateway"
 */
export function isKebunAlreadyHasGatewayError(error: unknown): boolean {
  const details = extractErrorDetails(error);
  if (details.status !== 422) return false;
  const msg = `${details.message} ${details.pesan}`.toLowerCase();
  return (
    msg.includes('sudah memiliki gateway') ||
    msg.includes('satu kebun hanya boleh punya satu gateway')
  );
}

/**
 * Memetakan error pembuatan gateway ke pesan bahasa Indonesia
 */
export function mapCreateGatewayError(error: unknown): string {
  const details = extractErrorDetails(error);

  if (details.status === 422) {
    if (isKebunAlreadyHasGatewayError(error)) {
      return 'Kebun ini sudah memiliki gateway. Satu kebun hanya boleh punya satu gateway.';
    }
    if (details.errors?.kode_perangkat && details.errors.kode_perangkat.length > 0) {
      return details.errors.kode_perangkat.join(', ');
    }
    if (details.errors?.blok_id && details.errors.blok_id.length > 0) {
      return 'Blok lahan tidak valid atau tidak ditemukan.';
    }
    if (details.message) return details.message;
  }

  if (details.status === 403) {
    return 'Anda tidak memiliki izin menambah gateway di area ini.';
  }

  if (details.status === 404) {
    return 'Data blok atau kebun tidak ditemukan di server.';
  }

  if (details.status === 408) {
    return 'Koneksi timeout, server tidak merespons tepat waktu.';
  }

  if (details.message && details.message !== 'Koneksi ke server gagal') {
    return details.message;
  }

  return 'Gagal menambahkan gateway baru.';
}

/**
 * Memetakan error pembuatan node sensor ke pesan bahasa Indonesia
 */
export function mapCreateNodeError(error: unknown, isSaasEnabled?: boolean): string {
  const details = extractErrorDetails(error);

  if (details.status === 422) {
    if (details.errors?.gateway_id && details.errors.gateway_id.length > 0) {
      return 'Gateway harus berasal dari kebun yang sama dengan blok node.';
    }
    if (details.errors?.blok_id && details.errors.blok_id.length > 0) {
      return 'Blok lahan ini sudah memiliki node sensor aktif. Satu blok hanya dapat dipasangkan dengan satu node.';
    }
    if (details.errors?.kode_perangkat && details.errors.kode_perangkat.length > 0) {
      return 'Kode perangkat node ini sudah digunakan atau tidak valid. Gunakan kode lain.';
    }
    if (details.errors?.qr_id && details.errors.qr_id.length > 0) {
      return 'Stiker QR Code tidak valid atau sudah terhubung ke node lain.';
    }
    if (details.errors?.jumlah_lampu && details.errors.jumlah_lampu.length > 0) {
      return 'Jumlah Lampu: ' + details.errors.jumlah_lampu.join(', ');
    }
    if (details.errors?.watt_per_lampu && details.errors.watt_per_lampu.length > 0) {
      return 'Daya per Lampu: ' + details.errors.watt_per_lampu.join(', ');
    }
    if (details.message) return details.message;
  }

  if (details.status === 403) {
    return isSaasEnabled
      ? 'Batas kuota perangkat sensor pada paket langganan Anda telah tercapai.'
      : 'Anda tidak memiliki izin menambah sensor di area ini.';
  }

  if (details.status === 404) {
    return 'Blok atau Gateway tidak ditemukan di server.';
  }

  if (details.message && details.message !== 'Koneksi ke server gagal') {
    return details.message;
  }

  return 'Gagal menambahkan node sensor baru.';
}

/**
 * Memetakan error update node sensor ke pesan bahasa Indonesia
 */
export function mapUpdateNodeError(error: unknown): string {
  const details = extractErrorDetails(error);

  if (details.status === 422) {
    if (details.errors?.gateway_id && details.errors.gateway_id.length > 0) {
      return 'Gateway harus berasal dari kebun yang sama dengan blok node.';
    }
    if (details.errors?.kode_perangkat && details.errors.kode_perangkat.length > 0) {
      return 'Kode perangkat node ini sudah digunakan atau tidak valid.';
    }
    if (details.errors?.jumlah_lampu && details.errors.jumlah_lampu.length > 0) {
      return 'Jumlah Lampu: ' + details.errors.jumlah_lampu.join(', ');
    }
    if (details.errors?.watt_per_lampu && details.errors.watt_per_lampu.length > 0) {
      return 'Daya per Lampu: ' + details.errors.watt_per_lampu.join(', ');
    }
    if (details.message) return details.message;
  }

  if (details.status === 403) {
    return 'Anda tidak memiliki izin memperbarui sensor di area ini.';
  }

  if (details.status === 404) {
    return 'Data sensor tidak ditemukan di server.';
  }

  if (details.message && details.message !== 'Koneksi ke server gagal') {
    return details.message;
  }

  return 'Gagal memperbarui data sensor.';
}

