<?php

namespace App\Console\Commands;

use App\Services\management_kebun\TelemetriProcessorService;
use Illuminate\Console\Command;
use PhpMqtt\Client\ConnectionSettings;
use PhpMqtt\Client\MqttClient;
use Throwable;

class MqttListen extends Command
{
    protected $signature = 'mqtt:listen';
    protected $description = 'Subscribe ke topic telemetri/energi semua gateway lewat MQTT, simpan ke database';

    public function handle(TelemetriProcessorService $processor): void
    {
        $client = new MqttClient(
            env('MQTT_HOST', '127.0.0.1'),
            (int) env('MQTT_PORT', 1883),
            'agrolight-backend-listener'
        );

        $settings = (new ConnectionSettings())
            ->setUsername(env('MQTT_BACKEND_USERNAME'))
            ->setPassword(env('MQTT_BACKEND_PASSWORD'));

        $client->connect($settings, true);

        $client->subscribe('agrolight/+/telemetri', function (string $topic, string $message) use ($processor) {
            $this->jalankanAman('TELEMETRI', $topic, function () use ($processor, $topic, $message) {
                $this->laporkan('TELEMETRI', $topic, $processor->prosesTelemetri($topic, $message));
            });
        }, 0);

        $client->subscribe('agrolight/+/energi', function (string $topic, string $message) use ($processor) {
            $this->jalankanAman('ENERGI', $topic, function () use ($processor, $topic, $message) {
                $this->laporkan('ENERGI', $topic, $processor->prosesEnergi($topic, $message));
            });
        }, 0);

        $this->info('Mendengarkan topic MQTT agrolight/+/telemetri dan agrolight/+/energi...');
        $this->info('(Ctrl+C buat berhenti)');

        $client->loop(true);
    }

    protected function jalankanAman(string $label, string $topic, callable $aksi): void
    {
        try {
            $aksi();
        } catch (Throwable $e) {
            $this->error("[$label] $topic -> error: {$e->getMessage()}");
            report($e);
        }
    }

    protected function laporkan(string $label, string $topic, array $hasil): void
    {
        if (!$hasil['success']) {
            $this->warn("[$label] $topic -> {$hasil['message']}, dilewati");
            return;
        }

        $this->line("[$label] $topic -> tersimpan (sensor_id: {$hasil['sensor_id']})");

        if ($label === 'TELEMETRI' && !empty($hasil['dimming'])) {
            $d = $hasil['dimming'];
            $pesan = $d['success']
                ? "intensitas {$d['data']->presentase_redup}%"
                : "dilewati: {$d['message']}";
            $this->line("[DIMMING] sensor {$hasil['sensor_id']} -> {$pesan}");
        }
    }
}