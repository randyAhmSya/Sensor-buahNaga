/**
 * Utilitas Pemetaan Daya Lampu (Watt) AgroLight
 * Sesuai aturan: jika watt null atau undefined, tampilkan 'Daya belum diisi', bukan 0.
 */

export interface NodeWithWatt {
  jumlah_lampu?: number | null;
  watt_per_lampu?: number | null;
  watt_terpasang?: number | null;
}

/**
 * Format representasi teks untuk daya terpasang (Watt)
 * @param watt Nilai watt numerik atau null/undefined
 * @returns 'Daya belum diisi' jika null/undefined, atau '{watt} W' jika angka
 */
export function formatWattTerpasang(watt: number | null | undefined): string {
  if (watt === null || watt === undefined) {
    return 'Daya belum diisi';
  }
  return `${watt} W`;
}

/**
 * Menghitung total beban watt untuk sekumpulan node dalam satu blok
 * Mengembalikan null jika salah satu node belum memiliki data watt
 * (mencegah salah informasi parsial pada user)
 */
export function hitungTotalWattBlok(nodes: NodeWithWatt[]): number | null {
  if (!nodes || nodes.length === 0) {
    return null;
  }

  for (const node of nodes) {
    if (node.watt_per_lampu === null || node.watt_per_lampu === undefined) {
      return null;
    }
  }

  const total = nodes.reduce((acc, curr) => {
    if (curr.watt_terpasang !== null && curr.watt_terpasang !== undefined) {
      return acc + curr.watt_terpasang;
    }
    const jumlahLampu = (curr.jumlah_lampu ?? 1) >= 1 ? (curr.jumlah_lampu ?? 1) : 1;
    const wattPerLampu = curr.watt_per_lampu ?? 0;
    return acc + jumlahLampu * wattPerLampu;
  }, 0);

  return Math.round(total * 100) / 100;
}

