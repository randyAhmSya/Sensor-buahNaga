<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Concerns\BuatDataUji;
use Tests\TestCase;

/**
 * Bukti penolakan/penerimaan upload foto:
 * hanya gambar jpeg/png/jpg/webp, maksimal 2 MB, dimensi maksimal 4096 px.
 * Aturan sumber: FileUploadTrait::aturanValidasiFoto().
 */
class UploadValidasiTest extends TestCase
{
    use RefreshDatabase;
    use BuatDataUji;

    private function ajukanBeli(UploadedFile $berkas)
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $paket = $this->buatPaketLangganan(['tambahan_hari' => 7]);

        Sanctum::actingAs($petani);

        return $this->postJson('/api/petani/langganan/beli', [
            'paket_langganan_id' => $paket->id_paket,
            'bukti_transfer' => $berkas,
        ]);
    }

    public function test_bukti_transfer_gambar_sah_diterima_dan_disimpan_privat(): void
    {
        Storage::fake('local');
        Storage::fake('public');

        $this->ajukanBeli(UploadedFile::fake()->image('bukti.png', 800, 600)->size(500))
            ->assertStatus(201);

        $this->assertCount(1, Storage::disk('local')->allFiles('bukti_transfer'));
        $this->assertCount(0, Storage::disk('public')->allFiles());
    }

    public function test_bukti_transfer_wajib_ada(): void
    {
        $tenant = $this->buatTenant();
        $paket = $this->buatPaketLangganan();
        Sanctum::actingAs($this->buatUser($tenant));

        $this->postJson('/api/petani/langganan/beli', ['paket_langganan_id' => $paket->id_paket])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['bukti_transfer']);
    }

    public function test_pdf_ditolak(): void
    {
        Storage::fake('local');

        $this->ajukanBeli(UploadedFile::fake()->create('bukti.pdf', 100, 'application/pdf'))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['bukti_transfer']);

        $this->assertCount(0, Storage::disk('local')->allFiles());
    }

    public function test_svg_ditolak(): void
    {
        Storage::fake('local');

        $svg = UploadedFile::fake()->createWithContent(
            'bukti.svg',
            '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'
        );

        $this->ajukanBeli($svg)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['bukti_transfer']);

        $this->assertCount(0, Storage::disk('local')->allFiles());
    }

    public function test_file_php_yang_disamarkan_jadi_jpg_ditolak(): void
    {
        Storage::fake('local');

        // isi file yang dicek, bukan ekstensinya
        $palsu = UploadedFile::fake()->createWithContent('bukti.jpg', '<?php echo "x"; ?>');

        $this->ajukanBeli($palsu)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['bukti_transfer']);

        $this->assertCount(0, Storage::disk('local')->allFiles());
    }

    public function test_gambar_lebih_dari_2mb_ditolak_dan_tepat_2mb_diterima(): void
    {
        Storage::fake('local');

        $this->ajukanBeli(UploadedFile::fake()->image('besar.jpg', 800, 600)->size(2049))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['bukti_transfer']);

        $this->ajukanBeli(UploadedFile::fake()->image('pas.jpg', 800, 600)->size(2048))
            ->assertStatus(201);
    }

    public function test_dimensi_lebih_dari_4096_px_ditolak(): void
    {
        Storage::fake('local');

        $this->ajukanBeli(UploadedFile::fake()->image('raksasa.jpg', 5000, 100))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['bukti_transfer']);
    }

    public function test_foto_kebun_memakai_aturan_yang_sama(): void
    {
        Storage::fake('public');

        $tenant = $this->buatTenant();
        Sanctum::actingAs($this->buatUser($tenant));

        $this->postJson('/api/petani/kebun', [
            'nama_kebun' => 'Kebun Uji',
            'foto' => UploadedFile::fake()->create('foto.pdf', 100, 'application/pdf'),
        ])->assertStatus(422)->assertJsonValidationErrors(['foto']);

        $this->postJson('/api/petani/kebun', [
            'nama_kebun' => 'Kebun Uji',
            'foto' => UploadedFile::fake()->image('foto.jpg', 800, 600)->size(2049),
        ])->assertStatus(422)->assertJsonValidationErrors(['foto']);
    }
}