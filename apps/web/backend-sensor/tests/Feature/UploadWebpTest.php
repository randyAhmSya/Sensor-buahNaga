<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Concerns\BuatDataUji;
use Tests\TestCase;

/**
 * Bukti bahwa gambar diperkecil dan disimpan sebagai WebP.
 * ->size() hanya mengubah ukuran yang dilaporkan, supaya perbandingan
 * "hasil lebih kecil dari asli" berlaku pada gambar uji yang sintetis.
 */
class UploadWebpTest extends TestCase
{
    use RefreshDatabase;
    use BuatDataUji;

    public function test_foto_kebun_besar_diperkecil_dan_disimpan_sebagai_webp(): void
    {
        Storage::fake('public');
        Sanctum::actingAs($this->buatUser($this->buatTenant()));

        $this->postJson('/api/petani/kebun', [
            'nama_kebun' => 'Kebun Webp',
            'foto' => UploadedFile::fake()->image('besar.jpg', 3000, 2000)->size(1500),
        ])->assertSuccessful();

        $berkas = Storage::disk('public')->allFiles('foto_kebun');
        $this->assertCount(1, $berkas);
        $this->assertStringEndsWith('.webp', $berkas[0]);

        [$lebar] = getimagesizefromstring(Storage::disk('public')->get($berkas[0]));
        $this->assertLessThanOrEqual(1280, $lebar);
    }

    public function test_gambar_kecil_tidak_diperbesar(): void
    {
        Storage::fake('public');
        Sanctum::actingAs($this->buatUser($this->buatTenant()));

        $this->postJson('/api/petani/kebun', [
            'nama_kebun' => 'Kebun Kecil',
            'foto' => UploadedFile::fake()->image('kecil.png', 300, 200)->size(50),
        ])->assertSuccessful();

        $berkas = Storage::disk('public')->allFiles('foto_kebun');
        $this->assertCount(1, $berkas);

        [$lebar] = getimagesizefromstring(Storage::disk('public')->get($berkas[0]));
        $this->assertSame(300, $lebar);
    }

    public function test_bukti_transfer_diperkecil_ke_webp_di_disk_privat(): void
    {
        Storage::fake('local');
        Storage::fake('public');

        $tenant = $this->buatTenant();
        $paket = $this->buatPaketLangganan(['tambahan_hari' => 7]);
        Sanctum::actingAs($this->buatUser($tenant));

        $this->postJson('/api/petani/langganan/beli', [
            'paket_langganan_id' => $paket->id_paket,
            'bukti_transfer' => UploadedFile::fake()->image('bukti.jpg', 3000, 2000)->size(1500),
        ])->assertStatus(201);

        $berkas = Storage::disk('local')->allFiles('bukti_transfer');
        $this->assertCount(1, $berkas);
        $this->assertStringEndsWith('.webp', $berkas[0]);
        $this->assertCount(0, Storage::disk('public')->allFiles());

        [$lebar] = getimagesizefromstring(Storage::disk('local')->get($berkas[0]));
        $this->assertLessThanOrEqual(1600, $lebar);
    }
}