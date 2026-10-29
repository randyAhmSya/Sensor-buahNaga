export interface SiklusPanenItem {
  id_siklus_panen: string;
  block_id: string;
  tanggal_penyinaran: string;
  target_hari_berbunga: number | null;
  tanggal_berbunga_aktual: string | null;
  target_hari_panen_setelah_bunga: number | null;
  estimasi_tanggal_panen: string | null;
  tanggal_panen: string | null;
  status_siklus: 'BERJALAN' | 'SELESAI' | 'GAGAL' | string;
  created_at?: string;
  updated_at?: string;
  blok?: {
    id_blok: string;
    nama_blok: string;
    kebun?: {
      id_kebun: string;
      nama_kebun: string;
    };
  };
}

export interface CreateSiklusPayload {
  block_id: string; // Sesuai validator addSiklusPanenRequest (dengan ck)
  tanggal_penyinaran: string; // YYYY-MM-DD
  target_hari_berbunga?: number;
  target_hari_panen_setelah_bunga?: number;
}

export interface UpdateSiklusPayload {
  target_hari_berbunga?: number;
  tanggal_berbunga_aktual?: string | null;
  target_hari_panen_setelah_bunga?: number;
  tanggal_panen?: string | null;
  status_siklus?: 'BERJALAN' | 'SELESAI' | 'GAGAL';
}

/**
 * Format tanggal ramah petani Indonesia: 26 Okt 2026
 */
export function formatTanggalPetani(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    const bulan = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    const day = d.getDate();
    const month = bulan[d.getMonth()];
    const year = d.getFullYear();

    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

export function hitungHariSisa(estimasiDateStr?: string | null): string {
  if (!estimasiDateStr) return '-';
  const target = new Date(estimasiDateStr);
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Siap Panen';
  if (diffDays < 7) return `${diffDays} Hari`;
  const weeks = Math.round(diffDays / 7);
  return `${weeks} Minggu`;
}

export function hitungRipenessPercent(
  tanggalMulaiStr: string,
  estimasiSelesaiStr?: string | null,
): number {
  if (!estimasiSelesaiStr) return 50;
  const start = new Date(tanggalMulaiStr).getTime();
  const end = new Date(estimasiSelesaiStr).getTime();
  const now = Date.now();

  if (now >= end) return 100;
  if (now <= start) return 10;
  const totalDuration = end - start;
  if (totalDuration <= 0) return 100;

  const elapsed = now - start;
  return Math.min(100, Math.max(10, Math.round((elapsed / totalDuration) * 100)));
}