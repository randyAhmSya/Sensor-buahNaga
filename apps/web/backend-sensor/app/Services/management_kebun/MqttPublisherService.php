<?php

namespace App\Services\management_kebun;

use App\Models\Gateway;
use App\Models\JadwalLampu;
use App\Models\NodeSensor;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use PhpMqtt\Client\ConnectionSettings;
use PhpMqtt\Client\MqttClient;
use Throwable;

class MqttPublisherService
{
    /**
     * Publish jadwal (ON/OFF + intensitas manual/minimum) buat satu node sensor.
     * $jadwal null berarti sensor ini nggak punya jadwal aktif sama sekali
     * (belum diatur, atau baru dihapus override-nya tanpa default kebun) -
     * dalam kasus itu nggak ada yang di-publish, biar nggak nimpa data lama
     * dengan sesuatu yang belum tentu benar.
     */
    public function publishJadwal(nodeSensor $sensor, ?JadwalLampu $jadwal): void
    {
        $kodePerangkat = $this->kodePerangkatGatewayUntukSensor($sensor);
        if (!$kodePerangkat) {
            Log::warning("[MQTT] Sensor {$sensor->id_sensor} nggak punya gateway terdaftar, publish jadwal dilewati.");
            return;
        }

        if (!$jadwal) {
            Log::info("[MQTT] Sensor {$sensor->id_sensor} nggak punya jadwal aktif, publish dilewati.");
            return;
        }

        $payload = [
            'id_jadwal_lampu'     => $jadwal->id_jadwal_lampu,
            'mode'                => $jadwal->mode,
            'jam_mulai_nyala'     => substr((string) $jadwal->jam_mulai_nyala, 0, 5),
            'jam_akhir_nyala'     => substr((string) $jadwal->jam_akhir_nyala, 0, 5),
            'intensitas_cahaya'   => $jadwal->instensitas_cahaya,
            'intensitas_minimum'  => $jadwal->intensitas_minimum,
            'diperbarui_pada'     => now()->toIso8601String(),
        ];

        $this->publish($this->topicJadwal($kodePerangkat, $sensor->id_sensor), $payload);
    }

    /**
     * Publish hasil auto-dimming buat satu node sensor.
     */
    public function publishDimming(nodeSensor $sensor, float $intensitas): void
    {
        $kodePerangkat = $this->kodePerangkatGatewayUntukSensor($sensor);
        if (!$kodePerangkat) {
            Log::warning("[MQTT] Sensor {$sensor->id_sensor} nggak punya gateway terdaftar, publish dimming dilewati.");
            return;
        }

        $payload = [
            'intensitas'    => round($intensitas, 2),
            'dihitung_pada' => now()->toIso8601String(),
        ];

        $this->publish($this->topicDimming($kodePerangkat, $sensor->id_sensor), $payload);
    }

    protected function topicJadwal(string $kodePerangkat, string $sensorId): string
    {
        return "agrolight/{$kodePerangkat}/{$sensorId}/jadwal";
    }

    protected function topicDimming(string $kodePerangkat, string $sensorId): string
    {
        return "agrolight/{$kodePerangkat}/{$sensorId}/dimming";
    }

    protected function kodePerangkatGatewayUntukSensor(nodeSensor $sensor): ?string
    {
        return Gateway::find($sensor->gateway_id)?->kode_perangkat;
    }

    /**
     * Connect - publish - disconnect sekali pakai. Sengaja nggak dibikin
     * satu koneksi persisten, karena ini dipanggil dari proses request HTTP
     * yang umurnya pendek, bukan proses panjang kayak mqtt:listen.
     *
     * Kalau broker lagi mati/nggak bisa dihubungi, ini CUMA dicatat ke log,
     * bukan bikin request HTTP yang manggilnya ikut gagal (bikin jadwal atau
     * hitung dimming tetap harus berhasil walau MQTT-nya lagi bermasalah).
     */
    protected function publish(string $topic, array $payload, int $qos = 1, bool $retain = true): void
    {
        $client = new MqttClient(
            env('MQTT_HOST', '127.0.0.1'),
            (int) env('MQTT_PORT', 1883),
            'agrolight-backend-publisher-' . Str::random(8)
        );

        try {
            $settings = (new ConnectionSettings())
                ->setUsername(env('MQTT_BACKEND_USERNAME'))
                ->setPassword(env('MQTT_BACKEND_PASSWORD'))
                ->setConnectTimeout(5);

            $client->connect($settings, true);
            $client->publish($topic, json_encode($payload), $qos, $retain);

            Log::info("[MQTT] publish -> $topic");
        } catch (Throwable $e) {
            Log::warning("[MQTT] Gagal publish ke $topic: {$e->getMessage()}");
            report($e);
        } finally {
            try {
                $client->disconnect();
            } catch (Throwable) {
                // udah putus atau emang belum sempat konek, aman diabaikan
            }
        }
    }
}
