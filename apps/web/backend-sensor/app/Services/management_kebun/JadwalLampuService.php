<?php

namespace App\Services\management_kebun;

use App\Exceptions\JadwalCooldownException;
use App\Models\blok;
use App\Models\JadwalLampu;
use App\Models\nodeSensor;
use DomainException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;

class JadwalLampuService
{
    public function __construct(protected MqttPublisherService $mqttPublisher)
    {
    }

    public function getAllJadwalByKebun(string $kebunId)
    {
        return JadwalLampu::where('kebun_id', $kebunId)->orderByDesc('created_at')->get();
    }

    public function getAllJadwalBySensor(string $sensorId)
    {
        return JadwalLampu::where('sensor_id', $sensorId)->orderByDesc('created_at')->get();
    }

    public function getJadwalById(string $id)
    {
        return JadwalLampu::find($id);
    }

    public function createJadwal(array $data)
    {
        $jadwal = DB::transaction(function () use ($data) {
            if (!empty($data['kebun_id'])) {
                JadwalLampu::where('kebun_id', $data['kebun_id'])
                    ->where('status_aktif', true)
                    ->update(['status_aktif' => false]);
            } elseif (!empty($data['sensor_id'])) {
                JadwalLampu::where('sensor_id', $data['sensor_id'])
                    ->where('status_aktif', true)
                    ->update(['status_aktif' => false]);
            }

            $data['status_aktif'] = true;

            return JadwalLampu::create($data);
        });

        $this->publishUntukSensorTerdampak($jadwal);

        return $jadwal;
    }

    public function updateJadwal(JadwalLampu $jadwal, array $data)
    {
        if ($jadwal->mode === 'manual' && array_key_exists('instensitas_cahaya', $data)) {
            $key = 'slider-jadwal:' . $jadwal->id_jadwal_lampu;
            $cooldown = (int) config('lampu.cooldown_slider_detik', 7);

            if (RateLimiter::tooManyAttempts($key, 1)) {
                $sisaDetik = RateLimiter::availableIn($key);
                throw new JadwalCooldownException(
                    "Terlalu cepat mengubah intensitas, tunggu {$sisaDetik} detik lagi biar lampu nggak flicker."
                );
            }

            RateLimiter::hit($key, $cooldown);
        }

        $jadwal->fill($data);

        if ($jadwal->mode === 'manual' && $jadwal->instensitas_cahaya === null) {
            throw new DomainException('Mode manual butuh instensitas_cahaya.');
        }
        if ($jadwal->mode === 'auto' && $jadwal->target_lux === null) {
            throw new DomainException('Mode auto butuh target_lux.');
        }
        if ($jadwal->mode === 'auto' && $jadwal->baseline_manual_persen === null) {
            throw new DomainException('Mode auto butuh baseline_manual_persen, biar laporan hemat listrik bisa dihitung.');
        }

        $jadwal->save();
        $this->publishUntukSensorTerdampak($jadwal);

        return $jadwal;
    }

    public function deleteJadwal(JadwalLampu $jadwal)
    {
        $sensorTerdampak = $this->sensorTerdampak($jadwal);

        $jadwal->delete();

        foreach ($sensorTerdampak as $sensor) {
            $this->mqttPublisher->publishJadwal($sensor, $this->resolveJadwalAktifUntukSensor($sensor->id_sensor));
        }
    }

    public function resolveJadwalAktifUntukSensor(string $sensorId): ?JadwalLampu
    {
        $override = JadwalLampu::where('sensor_id', $sensorId)->where('status_aktif', true)->first();
        if ($override) {
            return $override;
        }

        $sensor = nodeSensor::with('blok')->find($sensorId);
        if (!$sensor || !$sensor->blok) {
            return null;
        }

        return JadwalLampu::where('kebun_id', $sensor->blok->kebun_id)->where('status_aktif', true)->first();
    }

    public function sedangDalamJendelaNyala(JadwalLampu $jadwal, ?\Carbon\CarbonInterface $sekarang = null): bool
    {
        $sekarang ??= now(config('lampu.timezone', 'Asia/Jakarta'));

        $sekarangMenit = $sekarang->hour * 60 + $sekarang->minute;
        $mulai = $this->keMenit($jadwal->jam_mulai_nyala);
        $akhir = $this->keMenit($jadwal->jam_akhir_nyala);

        if ($mulai === $akhir) {
            return false;
        }

        if ($mulai < $akhir) {
            return $sekarangMenit >= $mulai && $sekarangMenit < $akhir;
        }

        return $sekarangMenit >= $mulai || $sekarangMenit < $akhir;
    }

    private function keMenit(mixed $jam): int
    {
        $t = \Carbon\Carbon::parse((string) $jam);
        return $t->hour * 60 + $t->minute;
    }

    protected function sensorTerdampak(JadwalLampu $jadwal)
    {
        if ($jadwal->sensor_id) {
            $sensor = nodeSensor::find($jadwal->sensor_id);
            return $sensor ? collect([$sensor]) : collect();
        }

        if ($jadwal->kebun_id) {
            $blokIds = blok::where('kebun_id', $jadwal->kebun_id)->pluck('id_blok');
            return nodeSensor::whereIn('blok_id', $blokIds)->get();
        }

        return collect();
    }

    protected function publishUntukSensorTerdampak(JadwalLampu $jadwal): void
    {
        foreach ($this->sensorTerdampak($jadwal) as $sensor) {
            $this->mqttPublisher->publishJadwal($sensor, $this->resolveJadwalAktifUntukSensor($sensor->id_sensor));
        }
    }
}
