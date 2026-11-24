<?php

namespace App\Services\management_kebun;

use App\Models\Gateway;
use App\Rules\KodePerangkatAman;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GatewayPairingService
{
    public function pair(string $kodePerangkat, string $kodePairing): array
    {
        $gw = Gateway::where('kode_perangkat', $kodePerangkat)->first();

        if (! $gw) {
            return ['success' => false, 'message' => 'Kode perangkat tidak dikenali.'];
        }

        if ($gw->token_gateway) {
            return ['success' => false, 'message' => 'Gateway ini sudah pernah dipasangkan sebelumnya.'];
        }

        if (! $gw->kode_pairing || $gw->kode_pairing !== $kodePairing) {
            return ['success' => false, 'message' => 'Kode pairing salah atau sudah tidak berlaku.'];
        }

        $token = Str::random(60);

        $gw->update([
            'token_gateway' => $token,
            'kode_pairing' => null, // sekali pakai, langsung dihabiskan
            'status_koneksi' => 'terhubung',
            'terakhir_terlihat' => now(),
        ]);

        $this->daftarkanKredensialMqtt($kodePerangkat, $token);

        return [
            'success' => true,
            'gateway_id' => $gw->id_gateway,
            'token_gateway' => $token,
        ];
    }

    /**
     * Daftarkan gateway sebagai pengguna Mosquitto (username = kode perangkat,
     * sandi = token) dan beri izin topik miliknya sendiri. Dilewati kalau
     * MOSQUITTO_PASSWD_BIN / MOSQUITTO_PASSWD_FILE belum diisi.
     *
     * Pakai config() bukan env(), supaya tetap jalan setelah `config:cache`.
     */
    protected function daftarkanKredensialMqtt(string $kodePerangkat, string $token): void
    {
        $passwdBin = config('mosquitto.passwd_bin');
        $passwdFile = config('mosquitto.passwd_file');
        $aclFile = config('mosquitto.acl_file');

        if (! $passwdBin || ! $passwdFile) {
            Log::warning('MQTT: MOSQUITTO_PASSWD_BIN / MOSQUITTO_PASSWD_FILE belum diisi, kredensial gateway tidak didaftarkan otomatis.');

            return;
        }

        if (! KodePerangkatAman::valid($kodePerangkat)) {
            Log::warning('Kode perangkat tidak valid, kredensial MQTT tidak didaftarkan.');

            return;
        }

        $cmd = sprintf(
            '%s -b %s %s %s 2>&1',
            escapeshellarg($passwdBin),
            escapeshellarg($passwdFile),
            escapeshellarg($kodePerangkat),
            escapeshellarg($token)
        );

        exec($cmd, $output, $exitCode);

        if ($exitCode !== 0) {
            Log::warning("Gagal daftarkan kredensial MQTT buat {$kodePerangkat}: ".implode("\n", $output));

            return;
        }

        if ($aclFile && file_exists($aclFile)) {
            $sudahAda = preg_match(
                '/^user '.preg_quote($kodePerangkat, '/').'\s*$/m',
                (string) file_get_contents($aclFile)
            ) === 1;

            if (! $sudahAda) {
                $aclEntry = "\nuser {$kodePerangkat}\ntopic readwrite agrolight/{$kodePerangkat}/#\n";
                file_put_contents($aclFile, $aclEntry, FILE_APPEND | LOCK_EX);
            }
        }

        $this->muatUlangBroker();
    }

    public function resetPairing(Gateway $gw): Gateway
    {
        $this->cabutKredensialMqtt($gw->kode_perangkat);

        $gw->update([
            'token_gateway' => null,
            'kode_pairing' => $this->buatKodePairingBaru(),
            'status_koneksi' => 'belum_terhubung',
            'terakhir_terlihat' => null,
        ]);

        return $gw->refresh();
    }

    protected function buatKodePairingBaru(): string
    {
        do {
            $kode = 'PAIR-'.strtoupper(Str::random(6));
        } while (Gateway::where('kode_pairing', $kode)->exists());

        return $kode;
    }

    protected function cabutKredensialMqtt(string $kodePerangkat): void
    {
        $passwdBin = config('mosquitto.passwd_bin');
        $passwdFile = config('mosquitto.passwd_file');

        if (! $passwdBin || ! $passwdFile) {
            return;
        }

        $cmd = sprintf(
            '%s -D %s %s 2>&1',
            escapeshellarg($passwdBin),
            escapeshellarg($passwdFile),
            escapeshellarg($kodePerangkat)
        );

        exec($cmd, $output, $exitCode);

        if ($exitCode !== 0) {
            Log::warning("Gagal cabut kredensial MQTT {$kodePerangkat}: ".implode("\n", $output));

            return;
        }

        $this->muatUlangBroker();
    }

    /**
     * Mosquitto hanya membaca ulang berkas sandi dan ACL saat menerima SIGHUP,
     * jadi tanpa ini akun baru baru berlaku setelah broker di-restart.
     * Isi MOSQUITTO_RELOAD_CMD, mis. "sudo /usr/bin/systemctl reload mosquitto".
     */
    protected function muatUlangBroker(): void
    {
        $cmd = config('mosquitto.reload_cmd');

        if (! $cmd) {
            return;
        }

        exec($cmd.' 2>&1', $output, $exitCode);

        if ($exitCode !== 0) {
            Log::warning('Gagal memuat ulang Mosquitto: '.implode("\n", $output));
        }
    }
}
