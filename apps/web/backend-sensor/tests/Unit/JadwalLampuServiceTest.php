<?php

namespace Tests\Unit;

use App\Models\JadwalLampu;
use App\Services\management_kebun\JadwalLampuService;
use App\Services\management_kebun\MqttPublisherService;
use Carbon\Carbon;
use PHPUnit\Framework\TestCase;

class JadwalLampuServiceTest extends TestCase
{
    protected JadwalLampuService $service;

    protected function setUp(): void
    {
        parent::setUp();
        // MqttPublisherService nggak butuh dependency apa pun, dan nggak
        // pernah dipanggil sama sedangDalamJendelaNyala() - aman di-new
        // langsung tanpa mock.
        $this->service = new JadwalLampuService(new MqttPublisherService());
    }

    private function jadwal(string $mulai, string $akhir): JadwalLampu
    {
        return new JadwalLampu([
            'jam_mulai_nyala' => $mulai,
            'jam_akhir_nyala' => $akhir,
        ]);
    }

    public function test_jendela_normal_dalam_hari_yang_sama(): void
    {
        $jadwal = $this->jadwal('06:00', '18:00');

        $this->assertTrue($this->service->sedangDalamJendelaNyala($jadwal, Carbon::parse('2026-01-01 12:00')));
        $this->assertFalse($this->service->sedangDalamJendelaNyala($jadwal, Carbon::parse('2026-01-01 05:59')));
        $this->assertFalse($this->service->sedangDalamJendelaNyala($jadwal, Carbon::parse('2026-01-01 18:00')));
    }

    public function test_jendela_yang_lewat_tengah_malam(): void
    {
        // kasus nyata buat penyinaran buah naga: nyala sore, mati pagi
        $jadwal = $this->jadwal('18:00', '06:00');

        $this->assertTrue($this->service->sedangDalamJendelaNyala($jadwal, Carbon::parse('2026-01-01 23:30')));
        $this->assertTrue($this->service->sedangDalamJendelaNyala($jadwal, Carbon::parse('2026-01-02 01:00')));
        $this->assertFalse($this->service->sedangDalamJendelaNyala($jadwal, Carbon::parse('2026-01-01 12:00')));
    }

    public function test_jam_mulai_sama_dengan_jam_akhir_dianggap_jendela_kosong(): void
    {
        $jadwal = $this->jadwal('08:00', '08:00');

        $this->assertFalse($this->service->sedangDalamJendelaNyala($jadwal, Carbon::parse('2026-01-01 08:00')));
    }
}