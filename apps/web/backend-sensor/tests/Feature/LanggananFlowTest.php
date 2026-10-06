<?php

namespace Tests\Feature;

use App\Models\LanggananTenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Concerns\BuatDataUji;
use Tests\TestCase;

class LanggananFlowTest extends TestCase
{
    use RefreshDatabase;
    use BuatDataUji;

    public function test_petani_bisa_ajukan_pembelian_dan_masuk_antrean_admin(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $paket = $this->buatPaketLangganan(['tambahan_hari' => 7]);

        Sanctum::actingAs($petani);

        $response = $this->postJson('/api/petani/langganan/beli', [
            'paket_langganan_id' => $paket->id_paket,
            'bukti_transfer' => UploadedFile::fake()->image('bukti.jpg'),
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('data.status_pembayaran', 'menunggu_verifikasi');

        $idTransaksi = $response->json('data.id_transaksi');

        $superAdmin = $this->buatUser(role: 'superAdmin');
        Sanctum::actingAs($superAdmin);

        $this->getJson('/api/admin/langganan/transaksi')
            ->assertStatus(200)
            ->assertJsonFragment(['id_transaksi' => $idTransaksi]);
    }

    public function test_verifikasi_menambah_sisa_hari_dan_tidak_bisa_diproses_dua_kali(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $paket = $this->buatPaketLangganan(['tambahan_hari' => 7]);

        Sanctum::actingAs($petani);
        $idTransaksi = $this->postJson('/api/petani/langganan/beli', [
            'paket_langganan_id' => $paket->id_paket,
            'bukti_transfer' => UploadedFile::fake()->image('bukti.jpg'),
        ])->json('data.id_transaksi');

        $superAdmin = $this->buatUser(role: 'superAdmin');
        Sanctum::actingAs($superAdmin);

        $this->patchJson("/api/admin/langganan/transaksi/{$idTransaksi}/verifikasi")
            ->assertStatus(200)
            ->assertJsonPath('data.status_pembayaran', 'berhasil');

        Sanctum::actingAs($petani);
        $this->getJson('/api/petani/langganan/status')
            ->assertStatus(200)
            ->assertJsonPath('data.sisa_hari', 7);

        Sanctum::actingAs($superAdmin);
        $this->patchJson("/api/admin/langganan/transaksi/{$idTransaksi}/verifikasi")
            ->assertStatus(409);

        Sanctum::actingAs($petani);
        $this->getJson('/api/petani/langganan/status')
            ->assertJsonPath('data.sisa_hari', 7); // nggak nambah lagi
    }

    public function test_tolak_butuh_alasan_dan_tidak_menambah_hari(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $paket = $this->buatPaketLangganan(['tambahan_hari' => 7]);

        Sanctum::actingAs($petani);
        $idTransaksi = $this->postJson('/api/petani/langganan/beli', [
            'paket_langganan_id' => $paket->id_paket,
            'bukti_transfer' => UploadedFile::fake()->image('bukti.jpg'),
        ])->json('data.id_transaksi');

        $superAdmin = $this->buatUser(role: 'superAdmin');
        Sanctum::actingAs($superAdmin);

        $this->patchJson("/api/admin/langganan/transaksi/{$idTransaksi}/tolak")
            ->assertStatus(422); // alasan wajib

        $this->patchJson("/api/admin/langganan/transaksi/{$idTransaksi}/tolak", [
            'alasan' => 'Bukti transfer tidak sesuai nominal.',
        ])->assertStatus(200)
            ->assertJsonPath('data.status_pembayaran', 'ditolak')
            ->assertJsonPath('data.alasan_penolakan', 'Bukti transfer tidak sesuai nominal.');

        Sanctum::actingAs($petani);
        $this->getJson('/api/petani/langganan/status')
            ->assertJsonPath('data.sisa_hari', 7);

        Sanctum::actingAs($superAdmin);
        $this->patchJson("/api/admin/langganan/transaksi/{$idTransaksi}/tolak", [
            'alasan' => 'Coba tolak lagi.',
        ])->assertStatus(409);

        $this->patchJson("/api/admin/langganan/transaksi/{$idTransaksi}/verifikasi")
            ->assertStatus(409);
    }

    public function test_kebun_terkunci_402_begitu_langganan_habis_lalu_terbuka_lagi_setelah_verifikasi(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $paket = $this->buatPaketLangganan(['tambahan_hari' => 7]);

        Sanctum::actingAs($petani);

        // trial otomatis kebentuk begitu nyentuh endpoint terproteksi pertama kali
        $this->getJson('/api/petani/kebun')->assertStatus(200);

        // paksa habis + lewatin masa tenggang
        LanggananTenant::where('tenant_id', $tenant->tenant_id)->update([
            'sisa_hari' => 0,
            'tanggal_aktif_terakhir' => now()->subDays(10),
        ]);

        $this->getJson('/api/petani/kebun')->assertStatus(402);

        $idTransaksi = $this->postJson('/api/petani/langganan/beli', [
            'paket_langganan_id' => $paket->id_paket,
            'bukti_transfer' => UploadedFile::fake()->image('bukti.jpg'),
        ])->assertStatus(201)->json('data.id_transaksi');

        $superAdmin = $this->buatUser(role: 'superAdmin');
        Sanctum::actingAs($superAdmin);
        $this->patchJson("/api/admin/langganan/transaksi/{$idTransaksi}/verifikasi")->assertStatus(200);

        Sanctum::actingAs($petani);
        $this->getJson('/api/petani/kebun')->assertStatus(200);
    }
}