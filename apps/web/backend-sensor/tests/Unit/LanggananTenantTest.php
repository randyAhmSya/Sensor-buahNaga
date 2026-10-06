<?php

namespace Tests\Unit;

use App\Models\LanggananTenant;
use Tests\TestCase;

/**
 * Pakai Tests\TestCase (bukan PHPUnit\Framework\TestCase murni) karena
 * method yang dites manggil now()/config() dari Laravel, yang butuh
 * container ke-boot. Nggak ada query database yang beneran jalan di sini -
 * model-nya cuma di-"new", nggak pernah di-save().
 */
class LanggananTenantTest extends TestCase
{
    public function test_sisa_hari_aktual_berkurang_sesuai_hari_yang_lewat(): void
    {
        $langganan = new LanggananTenant([
            'sisa_hari' => 10,
            'tanggal_aktif_terakhir' => now()->subDays(3),
        ]);

        $this->assertSame(7, $langganan->sisaHariAktual());
    }

    public function test_sisa_hari_aktual_nggak_pernah_minus(): void
    {
        $langganan = new LanggananTenant([
            'sisa_hari' => 2,
            'tanggal_aktif_terakhir' => now()->subDays(10),
        ]);

        $this->assertSame(0, $langganan->sisaHariAktual());
    }

    public function test_sisa_hari_aktual_nol_kalau_belum_pernah_checkpoint(): void
    {
        $langganan = new LanggananTenant(['sisa_hari' => 10]);

        $this->assertSame(0, $langganan->sisaHariAktual());
        $this->assertFalse($langganan->isAktif());
    }

    public function test_is_aktif_true_selama_sisa_hari_aktual_di_atas_nol(): void
    {
        $langganan = new LanggananTenant([
            'sisa_hari' => 5,
            'tanggal_aktif_terakhir' => now()->subDay(),
        ]);

        $this->assertTrue($langganan->isAktif());
    }

    public function test_dalam_masa_tenggang_begitu_sisa_hari_pas_habis(): void
    {
        $langganan = new LanggananTenant([
            'sisa_hari' => 5,
            'tanggal_aktif_terakhir' => now()->subDays(5), // pas abis hari ini
        ]);

        $this->assertFalse($langganan->isAktif());
        $this->assertTrue($langganan->dalamMasaTenggang());
        $this->assertSame('tenggang', $langganan->statusEfektif());
    }

    public function test_kadaluarsa_setelah_lewat_masa_tenggang(): void
    {
        $batasTenggang = (int) config('langganan.masa_tenggang_hari', 2);

        $langganan = new LanggananTenant([
            'sisa_hari' => 5,
            'tanggal_aktif_terakhir' => now()->subDays(5 + $batasTenggang + 1),
        ]);

        $this->assertFalse($langganan->dalamMasaTenggang());
        $this->assertSame('kadaluarsa', $langganan->statusEfektif());
    }
}