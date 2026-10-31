/**
 * Utility fungsi pemformatan tanggal dan waktu presisi
 * Menggunakan zona waktu lokal perangkat pengguna
 */

/**
 * Format waktu relatif dari ISO string (misal: "Baru saja", "5 menit lalu", "2 jam lalu")
 */
export function formatWaktuRelatif(dateStr?: string | null): string {
  if (!dateStr || dateStr.trim() === "") {
    return "Belum pernah mengirim data";
  }

  try {
    const timestamp = new Date(dateStr).getTime();
    if (isNaN(timestamp)) {
      return "Belum pernah mengirim data";
    }

    const now = Date.now();
    const diffSeconds = Math.max(0, Math.floor((now - timestamp) / 1000));

    if (diffSeconds < 60) {
      return "Baru saja";
    }

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
      return `${diffMinutes} menit lalu`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours} jam lalu`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) {
      return `${diffDays} hari lalu`;
    }

    // Jika lebih dari 30 hari, tampilkan tanggal lokal singkat
    const d = new Date(timestamp);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Belum pernah mengirim data";
  }
}

/**
 * Format teks data basi (misal: "Data terakhir 12 Okt, 03:10" atau "Data terakhir 03:10")
 */
export function formatWaktuBasi(dateStr?: string | null): string {
  if (!dateStr || dateStr.trim() === "") {
    return "Belum ada data";
  }

  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return "Belum ada data";
    }

    const tgl = d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
    const jam = d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `Data terakhir ${tgl}, ${jam}`;
  } catch {
    return "Belum ada data";
  }
}

/**
 * Format jam dan menit singkat (misal: "18:00") dari string waktu "18:00:00" atau ISO string
 */
export function formatJamMenit(timeOrIso?: string | null): string {
  if (!timeOrIso || timeOrIso.trim() === "") {
    return "-";
  }

  const trimmed = timeOrIso.trim();

  // Jika formatnya "HH:mm:ss" atau "HH:mm"
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    return trimmed.slice(0, 5);
  }

  // Jika format ISO date string
  try {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  } catch {
    // Abaikan dan kembalikan fallback
  }

  return trimmed;
}

