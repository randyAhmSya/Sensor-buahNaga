/**
 * Helper pemformat waktu relatif ramah pengguna berbahasa Indonesia (tanpa em dash)
 */
export function formatRelativeTime(dateString?: string | null, nowMs: number = Date.now()): string {
  if (!dateString) return '--';
  const trimmed = dateString.trim();
  if (!trimmed || trimmed === '-' || trimmed === '--' || trimmed === 'null' || trimmed === 'undefined') {
    return '--';
  }

  // Normalisasi format string SQL/Laravel tanpa timezone 'YYYY-MM-DD HH:mm:ss'
  let normalized = trimmed;
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(normalized)) {
    normalized = normalized.replace(' ', 'T');
  }

  const then = new Date(normalized).getTime();
  if (isNaN(then)) return '--';

  const diffMs = nowMs - then;

  // Tangani kemungkinan jitter jam lokal/server di mana selisih sedikit negatif (< 60 detik di masa depan)
  if (diffMs < 0 && diffMs > -60000) {
    return 'Baru saja';
  }

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) {
    return 'Baru saja';
  }

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin} menit yang lalu`;
  }

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) {
    return `${diffHour} jam yang lalu`;
  }

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) {
    return `${diffDay} hari yang lalu`;
  }

  return new Date(then).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  });
}

