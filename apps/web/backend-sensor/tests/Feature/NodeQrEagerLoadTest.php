<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureLanggananAktif;
use App\Models\KodeQr;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Concerns\BuatDataUji;
use Tests\TestCase;

/**
 * GET /api/petani/node?kebun_id= harus membawa relasi `qr` dan `blok.kebun`
 * dalam SATU response, supaya halaman web (stiker QR) tidak perlu request per node
 * dan tidak mengarang kode QR/nama kebun.
 */
class NodeQrEagerLoadTest extends TestCase
{
    use RefreshDatabase;
    use BuatDataUji;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(EnsureLanggananAktif::class);
    }

    private function pasangQr($node, string $teks): void
    {
        $idQr = (string) Str::uuid();
        KodeQr::forceCreate([
            'id_qr'        => $idQr,
            'teks_kode_qr' => $teks,
            'status_qr'    => true,
        ]);
        $node->forceFill(['qr_id' => $idQr])->save();
    }

    private function barisNode($res, string $idSensor): ?array
    {
        return collect($res->json('data'))->firstWhere('id_sensor', $idSensor);
    }

    public function test_daftar_node_memuat_teks_qr_dan_nama_kebun(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $kebun  = $this->buatKebun($tenant);
        $blok   = $this->buatBlok($kebun, ['nama_blok' => 'A']);
        $node   = $this->buatNodeSensor($blok, $this->buatGateway($blok));
        $this->pasangQr($node, 'QR-NODE-UJI123');

        Sanctum::actingAs($petani);
        $res = $this->getJson("/api/petani/node?kebun_id={$kebun->id_kebun}")->assertOk();

        $baris = $this->barisNode($res, $node->id_sensor);
        $this->assertNotNull($baris, 'Node tidak ada di response.');
        $this->assertSame('QR-NODE-UJI123', $baris['qr']['teks_kode_qr']);
        $this->assertTrue((bool) $baris['qr']['status_qr']);
        $this->assertSame($kebun->nama_kebun, $baris['blok']['kebun']['nama_kebun']);
    }

    public function test_node_tanpa_qr_mengembalikan_qr_null(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $kebun  = $this->buatKebun($tenant);
        $blok   = $this->buatBlok($kebun);
        $node   = $this->buatNodeSensor($blok, $this->buatGateway($blok));
        $node->forceFill(['qr_id' => null])->save();

        Sanctum::actingAs($petani);
        $res = $this->getJson("/api/petani/node?kebun_id={$kebun->id_kebun}")->assertOk();

        $baris = $this->barisNode($res, $node->id_sensor);
        $this->assertNotNull($baris);
        $this->assertNull($baris['qr'] ?? null);
    }

    public function test_jumlah_query_tidak_bertambah_seiring_jumlah_node(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $kebunKecil = $this->buatKebun($tenant);
        $kebunBesar = $this->buatKebun($tenant);

        $blok = $this->buatBlok($kebunKecil);
        $this->pasangQr($this->buatNodeSensor($blok, $this->buatGateway($blok)), 'QR-NODE-K1');

        for ($i = 0; $i < 5; $i++) {
            $b = $this->buatBlok($kebunBesar);
            $this->pasangQr($this->buatNodeSensor($b, $this->buatGateway($b)), 'QR-NODE-B' . $i);
        }

        Sanctum::actingAs($petani);

        DB::flushQueryLog();
        DB::enableQueryLog();
        $this->getJson("/api/petani/node?kebun_id={$kebunKecil->id_kebun}")->assertOk();
        $kecil = count(DB::getQueryLog());

        DB::flushQueryLog();
        $this->getJson("/api/petani/node?kebun_id={$kebunBesar->id_kebun}")->assertOk();
        $besar = count(DB::getQueryLog());

        $this->assertSame($kecil, $besar, 'Jumlah query harus tetap, bukan N+1.');
    }
}