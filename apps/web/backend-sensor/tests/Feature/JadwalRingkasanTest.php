<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureLanggananAktif;
use App\Models\Blok;
use App\Models\JadwalLampu;
use App\Models\NodeSensor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Illuminate\Testing\TestResponse;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Concerns\BuatDataUji;
use Tests\TestCase;

class JadwalRingkasanTest extends TestCase
{
    use RefreshDatabase;
    use BuatDataUji;

    protected function setUp(): void
    {
        parent::setUp();

        // Yang diuji di sini adalah logika ringkasan jadwal, bukan status langganan.
        // (Perilaku 402 sudah punya test sendiri di LanggananFlowTest.)
        $this->withoutMiddleware(EnsureLanggananAktif::class);
    }

    // ---------- helper ----------

    private function buatNodeDiBlok(Blok $blok): NodeSensor
    {
        return $this->buatNodeSensor($blok, $this->buatGateway($blok));
    }

    private function buatJadwal(array $override): JadwalLampu
    {
        return JadwalLampu::forceCreate(array_merge([
            'jam_mulai_nyala'    => '18:00:00',
            'jam_akhir_nyala'    => '05:00:00',
            'mode'               => 'manual',
            'instensitas_cahaya' => 80,
            'status_aktif'       => true,
        ], $override));
    }

    private function ringkasan(string $kebunId, string $query = ''): TestResponse
    {
        return $this->getJson("/api/petani/jadwal-lampu/ringkasan?kebun_id={$kebunId}{$query}");
    }

    private function barisBlok(TestResponse $res, string $idBlok): ?array
    {
        return collect($res->json('data.node'))->firstWhere('id_blok', $idBlok);
    }

    // ---------- skenario sumber jadwal ----------

    public function test_node_dengan_override_aktif_bersumber_override(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $kebun = $this->buatKebun($tenant);
        $blok = $this->buatBlok($kebun);
        $node = $this->buatNodeDiBlok($blok);

        $this->buatJadwal(['kebun_id' => $kebun->id_kebun]);
        $override = $this->buatJadwal(['sensor_id' => $node->id_sensor, 'jam_mulai_nyala' => '23:00:00']);

        Sanctum::actingAs($petani);
        $res = $this->ringkasan($kebun->id_kebun)->assertOk();

        $baris = $this->barisBlok($res, $blok->id_blok);
        $this->assertSame('override', $baris['sumber']);
        $this->assertSame($override->id_jadwal_lampu, $baris['jadwal']['id_jadwal_lampu']);
        $this->assertSame($node->id_sensor, $baris['id_sensor']);
        $this->assertSame($node->kode_perangkat, $baris['kode_perangkat']);
    }

    public function test_node_tanpa_override_memakai_default_kebun(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $kebun = $this->buatKebun($tenant);
        $blok = $this->buatBlok($kebun);
        $this->buatNodeDiBlok($blok);

        $default = $this->buatJadwal(['kebun_id' => $kebun->id_kebun]);

        Sanctum::actingAs($petani);
        $res = $this->ringkasan($kebun->id_kebun)->assertOk();

        $baris = $this->barisBlok($res, $blok->id_blok);
        $this->assertSame('default', $baris['sumber']);
        $this->assertSame($default->id_jadwal_lampu, $baris['jadwal']['id_jadwal_lampu']);
        $this->assertSame($default->id_jadwal_lampu, $res->json('data.default_kebun.id_jadwal_lampu'));
    }

    public function test_tanpa_override_dan_tanpa_default_bersumber_belum_ada(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $kebun = $this->buatKebun($tenant);
        $blok = $this->buatBlok($kebun);
        $this->buatNodeDiBlok($blok);

        Sanctum::actingAs($petani);
        $res = $this->ringkasan($kebun->id_kebun)->assertOk();

        $baris = $this->barisBlok($res, $blok->id_blok);
        $this->assertSame('belum_ada', $baris['sumber']);
        $this->assertNull($baris['jadwal']);
        $this->assertNull($res->json('data.default_kebun'));
    }

    public function test_blok_tanpa_node_bersumber_tanpa_node(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $kebun = $this->buatKebun($tenant);
        $blok = $this->buatBlok($kebun);

        $this->buatJadwal(['kebun_id' => $kebun->id_kebun]);

        Sanctum::actingAs($petani);
        $res = $this->ringkasan($kebun->id_kebun)->assertOk();

        $baris = $this->barisBlok($res, $blok->id_blok);
        $this->assertSame('tanpa_node', $baris['sumber']);
        $this->assertNull($baris['id_sensor']);
        $this->assertNull($baris['jadwal']);
    }

    public function test_jadwal_nonaktif_tidak_dihitung(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $kebun = $this->buatKebun($tenant);
        $blok = $this->buatBlok($kebun);
        $node = $this->buatNodeDiBlok($blok);

        $default = $this->buatJadwal(['kebun_id' => $kebun->id_kebun]);
        $this->buatJadwal(['sensor_id' => $node->id_sensor, 'status_aktif' => false]);

        Sanctum::actingAs($petani);
        $res = $this->ringkasan($kebun->id_kebun)->assertOk();

        // override-nya nonaktif (riwayat) → jatuh ke default kebun
        $baris = $this->barisBlok($res, $blok->id_blok);
        $this->assertSame('default', $baris['sumber']);
        $this->assertSame($default->id_jadwal_lampu, $baris['jadwal']['id_jadwal_lampu']);
    }

    public function test_campuran_override_dan_default_dalam_satu_kebun(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $kebun = $this->buatKebun($tenant);

        $blokA = $this->buatBlok($kebun, ['nama_blok' => 'Blok A']);
        $blokB = $this->buatBlok($kebun, ['nama_blok' => 'Blok B']);
        $nodeB = $this->buatNodeDiBlok($blokB);
        $this->buatNodeDiBlok($blokA);

        $this->buatJadwal(['kebun_id' => $kebun->id_kebun]);
        $this->buatJadwal(['sensor_id' => $nodeB->id_sensor]);

        Sanctum::actingAs($petani);
        $res = $this->ringkasan($kebun->id_kebun)->assertOk();

        $this->assertSame('default', $this->barisBlok($res, $blokA->id_blok)['sumber']);
        $this->assertSame('override', $this->barisBlok($res, $blokB->id_blok)['sumber']);
    }

    public function test_override_kebun_lain_tidak_bocor(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $kebun = $this->buatKebun($tenant);
        $blok = $this->buatBlok($kebun);
        $this->buatNodeDiBlok($blok);

        $kebunLain = $this->buatKebun($tenant);
        $blokLain = $this->buatBlok($kebunLain);
        $nodeLain = $this->buatNodeDiBlok($blokLain);
        $this->buatJadwal(['sensor_id' => $nodeLain->id_sensor]);

        Sanctum::actingAs($petani);
        $res = $this->ringkasan($kebun->id_kebun)->assertOk();

        $this->assertCount(1, $res->json('data.node'));
        $this->assertNull($this->barisBlok($res, $blokLain->id_blok));
        $this->assertSame('belum_ada', $this->barisBlok($res, $blok->id_blok)['sumber']);
    }

    // ---------- akses & validasi ----------

    public function test_tenant_lain_ditolak_403(): void
    {
        $tenant = $this->buatTenant();
        $kebun = $this->buatKebun($tenant);

        $petaniLain = $this->buatUser($this->buatTenant());
        Sanctum::actingAs($petaniLain);

        $this->ringkasan($kebun->id_kebun)->assertStatus(403);
    }

    public function test_tanpa_kebun_id_mengembalikan_400_bukan_ditangkap_route_show(): void
    {
        $petani = $this->buatUser($this->buatTenant());
        Sanctum::actingAs($petani);

        // Kalau route "ringkasan" salah urutan, ini ditangkap show({id}) dan jadi 404/403.
        $this->getJson('/api/petani/jadwal-lampu/ringkasan')->assertStatus(400);
    }

    public function test_kebun_tidak_ada_mengembalikan_404(): void
    {
        $petani = $this->buatUser($this->buatTenant());
        Sanctum::actingAs($petani);

        $this->ringkasan((string) Str::uuid())->assertStatus(404);
    }

    public function test_tanpa_login_ditolak_401(): void
    {
        $kebun = $this->buatKebun($this->buatTenant());

        $this->ringkasan($kebun->id_kebun)->assertStatus(401);
    }

    // ---------- paginasi ----------

    public function test_per_page_membatasi_jumlah_baris_dan_ada_meta(): void
    {
        $tenant = $this->buatTenant();
        $petani = $this->buatUser($tenant);
        $kebun = $this->buatKebun($tenant);

        foreach (['A', 'B', 'C'] as $huruf) {
            $this->buatBlok($kebun, ['nama_blok' => "Blok {$huruf}"]);
        }

        Sanctum::actingAs($petani);
        $res = $this->ringkasan($kebun->id_kebun, '&per_page=2')->assertOk();

        $this->assertCount(2, $res->json('data.node'));
        $this->assertArrayHasKey('meta', $res->json());
    }
}