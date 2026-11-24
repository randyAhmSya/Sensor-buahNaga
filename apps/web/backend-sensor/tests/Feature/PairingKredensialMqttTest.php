<?php

namespace Tests\Feature;

use App\Models\Gateway;
use App\Services\management_kebun\GatewayPairingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\Feature\Concerns\BuatDataUji;
use Tests\TestCase;

/**
 * Pairing harus mendaftarkan gateway ke Mosquitto secara otomatis.
 * Biner mosquitto_passwd dan perintah reload diganti skrip palsu yang
 * hanya mencatat pemanggilannya, jadi tes tidak menyentuh broker sungguhan.
 * Skrip palsu: .sh di Linux/macOS, .bat di Windows.
 */
class PairingKredensialMqttTest extends TestCase
{
    use BuatDataUji;
    use RefreshDatabase;

    private string $dir;

    protected function setUp(): void
    {
        parent::setUp();

        $this->dir = sys_get_temp_dir().DIRECTORY_SEPARATOR.'mqtt-uji-'.Str::random(8);
        mkdir($this->dir);

        file_put_contents($this->dir.DIRECTORY_SEPARATOR.'acl', "user agrolight_backend\ntopic readwrite agrolight/+/telemetri\n");
        file_put_contents($this->dir.DIRECTORY_SEPARATOR.'passwd', '');

        config([
            'mosquitto.passwd_bin' => $this->buatSkripPalsu('passwd-palsu', 'passwd.log'),
            'mosquitto.passwd_file' => $this->dir.DIRECTORY_SEPARATOR.'passwd',
            'mosquitto.acl_file' => $this->dir.DIRECTORY_SEPARATOR.'acl',
            'mosquitto.reload_cmd' => $this->buatSkripPalsu('reload-palsu', 'reload.log', 'reload'),
        ]);
    }

    protected function tearDown(): void
    {
        foreach (glob($this->dir.DIRECTORY_SEPARATOR.'*') ?: [] as $berkas) {
            @unlink($berkas);
        }
        @rmdir($this->dir);

        parent::tearDown();
    }

    /**
     * Skrip yang mencatat argumennya (atau teks tetap $teks) ke berkas log.
     */
    private function buatSkripPalsu(string $nama, string $log, ?string $teks = null): string
    {
        $jalurLog = $this->dir.DIRECTORY_SEPARATOR.$log;

        if (PHP_OS_FAMILY === 'Windows') {
            $jalur = $this->dir.DIRECTORY_SEPARATOR.$nama.'.bat';
            $isi = $teks ?? '%*';
            file_put_contents($jalur, "@echo off\r\necho {$isi}>> \"{$jalurLog}\"\r\n");

            return $jalur;
        }

        $jalur = $this->dir.DIRECTORY_SEPARATOR.$nama.'.sh';
        $isi = $teks ?? '"$@"';
        file_put_contents($jalur, "#!/bin/sh\necho {$isi} >> \"{$jalurLog}\"\n");
        chmod($jalur, 0755);

        return $jalur;
    }

    private function buatGatewayBelumPairing(): Gateway
    {
        $blok = $this->buatBlok($this->buatKebun($this->buatTenant()));

        return $this->buatGateway($blok, [
            'kode_perangkat' => 'GTW-TES-01',
            'kode_pairing' => 'PAIR-ABC123',
            'token_gateway' => null,
        ]);
    }

    private function pairing(): string
    {
        return $this->postJson('/api/petani/gateway/pair', [
            'kode_perangkat' => 'GTW-TES-01',
            'kode_pairing' => $this->kodePairingSekarang ?? 'PAIR-ABC123',
        ])->assertOk()->json('data.token_gateway');
    }

    private ?string $kodePairingSekarang = null;

    /** Isi berkas log; tanda kutip dibuang dan "\" jadi "/" agar sama di semua OS. */
    private function baca(string $nama): string
    {
        $jalur = $this->dir.DIRECTORY_SEPARATOR.$nama;
        $isi = file_exists($jalur) ? (string) file_get_contents($jalur) : '';

        return str_replace(['"', '\\', "\r"], ['', '/', ''], $isi);
    }

    private function dirNormal(): string
    {
        return str_replace('\\', '/', $this->dir);
    }

    private function bacaAcl(): string
    {
        return str_replace("\r", '', (string) file_get_contents($this->dir.DIRECTORY_SEPARATOR.'acl'));
    }

    public function test_pairing_mendaftarkan_akun_acl_dan_memuat_ulang_broker(): void
    {
        $this->buatGatewayBelumPairing();

        $token = $this->pairing();

        $this->assertStringContainsString("-b {$this->dirNormal()}/passwd GTW-TES-01 {$token}", $this->baca('passwd.log'));
        $this->assertStringContainsString("user GTW-TES-01\ntopic readwrite agrolight/GTW-TES-01/#", $this->bacaAcl());
        $this->assertStringContainsString('reload', $this->baca('reload.log'));
    }

    public function test_pairing_ulang_setelah_reset_tidak_menggandakan_acl(): void
    {
        $gateway = $this->buatGatewayBelumPairing();
        $this->pairing();

        app(GatewayPairingService::class)->resetPairing($gateway->fresh());
        $this->assertStringContainsString("-D {$this->dirNormal()}/passwd GTW-TES-01", $this->baca('passwd.log'));

        $this->kodePairingSekarang = $gateway->fresh()->kode_pairing;
        $this->pairing();

        $this->assertSame(1, substr_count($this->bacaAcl(), "user GTW-TES-01\n"));
        $this->assertSame(3, substr_count($this->baca('reload.log'), 'reload'));
    }

    public function test_tanpa_konfigurasi_pairing_tetap_berhasil_tanpa_menyentuh_broker(): void
    {
        config([
            'mosquitto.passwd_bin' => null,
            'mosquitto.passwd_file' => null,
            'mosquitto.reload_cmd' => null,
        ]);
        $this->buatGatewayBelumPairing();

        $this->pairing();

        $this->assertSame('', $this->baca('passwd.log'));
        $this->assertSame('', $this->baca('reload.log'));
    }

    public function test_reload_yang_gagal_tidak_menggagalkan_pairing(): void
    {
        config(['mosquitto.reload_cmd' => 'perintah-yang-tidak-ada-xyz']);
        $this->buatGatewayBelumPairing();

        $token = $this->pairing();

        $this->assertNotSame('', $token);
        $this->assertStringContainsString('GTW-TES-01', $this->baca('passwd.log'));
    }
}
