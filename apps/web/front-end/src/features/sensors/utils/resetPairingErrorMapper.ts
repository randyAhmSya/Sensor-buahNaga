/**
 * Pemetaan murni status HTTP dan objek galat menjadi pesan ramah pengguna berbahasa Indonesia.
 * Bebas dari karakter dash terlarang.
 */
export function mapResetPairingError(error: unknown): string {
  let status: number | undefined;

  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as { status: unknown }).status === 'number'
  ) {
    status = (error as { status: number }).status;
  }

  if (status === 403) {
    return 'Anda tidak punya izin mereset gateway ini';
  }

  if (status === 404) {
    return 'Gateway tidak ditemukan';
  }

  if (status === 402) {
    return 'Masa aktif langganan Anda telah habis. Silakan perpanjang paket langganan Anda.';
  }

  if (status === 401) {
    return 'Sesi login telah kedaluwarsa. Silakan masuk kembali.';
  }

  if (status === 408) {
    return 'Koneksi timeout, server tidak merespons tepat waktu.';
  }

  if (status === 400) {
    return 'ID gateway tidak valid atau permintaan tidak lengkap.';
  }

  return 'Gagal mereset pairing gateway. Silakan coba beberapa saat lagi.';
}
