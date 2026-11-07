<?php

namespace Tests\Feature;

use App\Models\JadwalLampu;
use App\Services\management_kebun\JadwalLampuService;
use Carbon\Carbon;
use Tests\TestCase;

class JendelaNyalaZonaWaktuTest extends TestCase
{
    private function jadwal(): JadwalLampu
    {
        return new JadwalLampu(['jam_mulai_nyala' => '21:00', 'jam_akhir_nyala' => '07:00']);
    }

    private function dalamJendela(string $waktuUtc): bool
    {
        $this->travelTo(Carbon::parse($waktuUtc, 'UTC'));

        return app(JadwalLampuService::class)->sedangDalamJendelaNyala($this->jadwal());
    }

    public function test_jalur_bawaan_memakai_waktu_wib_bukan_utc(): void
    {
        config(['lampu.timezone' => 'Asia/Jakarta']);

        $this->assertTrue($this->dalamJendela('2026-01-01 14:30:00'));   // 21:30 WIB
        $this->assertTrue($this->dalamJendela('2026-01-01 23:30:00'));   // 06:30 WIB
        $this->assertFalse($this->dalamJendela('2026-01-02 00:30:00'));  // 07:30 WIB
        $this->assertFalse($this->dalamJendela('2026-01-02 05:00:00'));  // 12:00 WIB
    }

    public function test_zona_waktu_mengikuti_config(): void
    {
        config(['lampu.timezone' => 'Asia/Makassar']); // UTC+8

        $this->assertTrue($this->dalamJendela('2026-01-01 14:30:00'));   // 22:30 WITA
        $this->assertFalse($this->dalamJendela('2026-01-01 23:30:00'));  // 07:30 WITA
    }
}