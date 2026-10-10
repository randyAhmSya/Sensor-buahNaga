<?php

namespace App\Services\management_kebun;

use App\Models\Gateway;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GatewayPairingService
{
    /**
     * Validasi kode_perangkat + kode_pairing dari ESP32, lalu terbitkan
     * token_gateway permanen yang dipakai sebagai kredensial MQTT,
     * SEKALIGUS daftarkan kredensial itu ke broker Mosquitto (password
     * file + ACL) biar gateway bisa langsung publish tanpa setup manual.
     */
    public function pair(string $kodePerangkat, string $kodePairing): array
    {
        $gw = Gateway::where('kode_perangkat', $kodePerangkat)->first();

        if (!$gw) {
            return ['success' => false, 'message' => 'Kode perangkat tidak dikenali.'];
        }

        if ($gw->token_gateway) {
            return ['success' => false, 'message' => 'Gateway ini sudah pernah dipasangkan sebelumnya.'];
        }

        if (!$gw->kode_pairing || $gw->kode_pairing !== $kodePairing) {
            return ['success' => false, 'message' => 'Kode pairing salah atau sudah tidak berlaku.'];
        }

        $token = Str::random(60);

        $gw->update([
            'token_gateway'     => $token,
            'kode_pairing'      => null, // sekali pakai, langsung dihabiskan
            'status_koneksi'    => 'terhubung',
            'terakhir_terlihat' => now(),
        ]);

        $this->daftarkanKredensialMqtt($kodePerangkat, $token);

        return [
            'success'       => true,
            'gateway_id'    => $gw->id_gateway,
            'token_gateway' => $token,
        ];
    }

    /**
     * Daftarkan username/password gateway ini ke password file Mosquitto,
     * dan tambahkan aturan ACL supaya dia cuma bisa publish/subscribe
     * ke topic miliknya sendiri (agrolight/{kode_perangkat}/#).
     *
     * Kalau MOSQUITTO_PASSWD_FILE belum diset di .env (broker belum
     * dikonfigurasi), fungsi ini diam-diam di-skip - proses pairing HTTP
     * tetap berhasil, cuma kredensial MQTT-nya belum terdaftar.
     */
    protected function daftarkanKredensialMqtt(string $kodePerangkat, string $token): void
    {
        $passwdBin  = env('MOSQUITTO_PASSWD_BIN');
        $passwdFile = env('MOSQUITTO_PASSWD_FILE');
        $aclFile    = env('MOSQUITTO_ACL_FILE');

        if (!$passwdBin || !$passwdFile) {
            return;
        }

        $cmd = sprintf(
            '%s -b %s %s %s',
            escapeshellarg($passwdBin),
            escapeshellarg($passwdFile),
            escapeshellarg($kodePerangkat),
            escapeshellarg($token)
        );

        exec($cmd, $output, $exitCode);

        if ($exitCode !== 0) {
            Log::warning("Gagal daftarkan kredensial MQTT buat {$kodePerangkat}: " . implode("\n", $output));
            return;
        }

        if ($aclFile && file_exists($aclFile)) {
            $aclEntry = "\nuser {$kodePerangkat}\ntopic readwrite agrolight/{$kodePerangkat}/#\n";
            file_put_contents($aclFile, $aclEntry, FILE_APPEND);
        }
    }
}