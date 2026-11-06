import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatWattTerpasang,
  hitungTotalWattBlok,
  type NodeWithWatt,
} from './lampWattMapper.ts';

describe('lampWattMapper - formatWattTerpasang', () => {
  it('menghasilkan "Daya belum diisi" jika nilai null', () => {
    const hasil = formatWattTerpasang(null);
    assert.equal(hasil, 'Daya belum diisi');
    assert.notEqual(hasil, '0');
    assert.notEqual(hasil, '0 W');
  });

  it('menghasilkan "Daya belum diisi" jika nilai undefined', () => {
    const hasil = formatWattTerpasang(undefined);
    assert.equal(hasil, 'Daya belum diisi');
  });

  it('menghasilkan "0 W" jika nilai angka 0', () => {
    const hasil = formatWattTerpasang(0);
    assert.equal(hasil, '0 W');
  });

  it('menghasilkan format angka W yang presisi', () => {
    assert.equal(formatWattTerpasang(150), '150 W');
    assert.equal(formatWattTerpasang(120.5), '120.5 W');
  });
});

describe('lampWattMapper - hitungTotalWattBlok', () => {
  it('mengembalikan null jika array node kosong', () => {
    assert.equal(hitungTotalWattBlok([]), null);
  });

  it('mengembalikan null jika ada salah satu node yang watt_per_lampu bernilai null', () => {
    const nodes: NodeWithWatt[] = [
      { jumlah_lampu: 10, watt_per_lampu: 15, watt_terpasang: 150 },
      { jumlah_lampu: 5, watt_per_lampu: null, watt_terpasang: null },
    ];
    assert.equal(hitungTotalWattBlok(nodes), null);
  });

  it('mengembalikan null jika ada node yang watt_per_lampu bernilai undefined', () => {
    const nodes: NodeWithWatt[] = [
      { jumlah_lampu: 10, watt_per_lampu: 15, watt_terpasang: 150 },
      { jumlah_lampu: 5 },
    ];
    assert.equal(hitungTotalWattBlok(nodes), null);
  });

  it('menghitung total beban watt saat seluruh node memiliki data watt lengkap', () => {
    const nodes: NodeWithWatt[] = [
      { jumlah_lampu: 10, watt_per_lampu: 15, watt_terpasang: 150 },
      { jumlah_lampu: 5, watt_per_lampu: 20, watt_terpasang: 100 },
    ];
    assert.equal(hitungTotalWattBlok(nodes), 250);
  });

  it('menghitung estimasi watt_terpasang jika watt_terpasang belum ada tapi watt_per_lampu ada', () => {
    const nodes: NodeWithWatt[] = [
      { jumlah_lampu: 4, watt_per_lampu: 25 },
      { jumlah_lampu: 2, watt_per_lampu: 50 },
    ];
    assert.equal(hitungTotalWattBlok(nodes), 200);
  });
});

