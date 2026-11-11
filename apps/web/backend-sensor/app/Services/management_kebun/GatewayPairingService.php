<?php

namespace App\Services\management_kebun;

use App\Models\Gateway;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GatewayPairingService
{
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

    protected function daftarkanKredensialMqtt(string $kodePerangkat, string $token): void
    {
        $passwdBin  = env('MOSQUITTO_PASSWD_BIN');
        $passwdFile = env('MOSQUITTO_PASSWD_FILE');
        $aclFile    = env('MOSQUITTO_ACL_FILE');

        if (!$passwdBin || !$passwdFile) {
            return;
        }

        if (!\App\Rules\KodePerangkatAman::valid($kodePerangkat)) {
            Log::warning('Kode perangkat tidak valid, kredensial MQTT tidak didaftarkan.');
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
    public function resetPairing(gateway $gw): gateway
    {
        $this->cabutKredensialMqtt($gw->kode_perangkat);

        $gw->update([
            'token_gateway'     => null,
            'kode_pairing'      => $this->buatKodePairingBaru(),
            'status_koneksi'    => 'belum_terhubung',
            'terakhir_terlihat' => null,
        ]);

        return $gw->refresh();
    }

    protected function buatKodePairingBaru(): string
    {
        do {
            $kode = 'PAIR-' . strtoupper(Str::random(6));
        } while (gateway::where('kode_pairing', $kode)->exists());

        return $kode;
    }

    protected function cabutKredensialMqtt(string $kodePerangkat): void
    {
        $passwdBin  = env('MOSQUITTO_PASSWD_BIN');
        $passwdFile = env('MOSQUITTO_PASSWD_FILE');

        if (!$passwdBin || !$passwdFile) {
            return;
        }

        $cmd = sprintf(
            '%s -D %s %s',
            escapeshellarg($passwdBin),
            escapeshellarg($passwdFile),
            escapeshellarg($kodePerangkat)
        );

        exec($cmd, $output, $exitCode);

        if ($exitCode !== 0) {
            Log::warning("Gagal cabut kredensial MQTT {$kodePerangkat}: " . implode("\n", $output));
        }
    }
}
