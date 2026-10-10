<?php

namespace Tests\Feature\Concerns;

use App\Models\Blok;
use App\Models\Gateway;
use App\Models\Kebun;
use App\Models\KodeQr;
use App\Models\NodeSensor;
use App\Models\PaketLangganan;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tests\TestCase;
trait BuatDataUji
{
    protected function buatTenant(array $override = []): Tenant
    {
        return Tenant::create(array_merge([
            'nama_tenant' => 'Tenant Uji ' . Str::random(6),
            'paket_langganan' => 'gratis',
            'is_aktif' => true,
            'is_admin_allowed' => false,
        ], $override));
    }

    protected function buatUser(?Tenant $tenant = null, string $role = 'petani_biasa'): User
    {
        return User::create([
            'tenant_id' => $tenant?->tenant_id,
            'nama_lengkap' => 'User Uji ' . Str::random(6),
            'email' => Str::random(10) . '@example.com',
            'password' => Hash::make('password123'),
            'role' => $role,
        ]);
    }

    protected function buatKebun(Tenant $tenant, array $override = []): Kebun
    {
        return Kebun::create(array_merge([
            'tenant_id' => $tenant->tenant_id,
            'nama_kebun' => 'Kebun Uji ' . Str::random(6),
            'status_kebun' => true,
        ], $override));
    }

    protected function buatBlok(Kebun $kebun, array $override = []): Blok
    {
        return Blok::create(array_merge([
            'kebun_id' => $kebun->id_kebun,
            'nama_blok' => 'Blok Uji ' . Str::random(6),
        ], $override));
    }

    protected function buatGateway(Blok $blok, array $override = []): Gateway
    {
        return Gateway::create(array_merge([
            'blok_id' => $blok->id_blok,
            'kode_perangkat' => 'GW-UJI-' . Str::random(8),
            'status_koneksi' => 'belum_terhubung',
        ], $override));
    }

    protected function buatKodeQr(array $override = []): KodeQr
    {
        return KodeQr::create(array_merge([
            'teks_kode_qr' => 'QR-UJI-' . Str::random(8),
            'status_qr' => true,
        ], $override));
    }

    protected function buatNodeSensor(Blok $blok, Gateway $gateway, ?KodeQr $qr = null, array $override = []): NodeSensor
    {
        $qr ??= $this->buatKodeQr();

        return NodeSensor::create(array_merge([
            'blok_id' => $blok->id_blok,
            'gateway_id' => $gateway->id_gateway,
            'qr_id' => $qr->id_qr,
            'kode_perangkat' => 'NODE-UJI-' . Str::random(8),
            'tipe_sensor' => 'lux_suhu',
            'status_koneksi' => 'aktif',
        ], $override));
    }
    protected function buatPaketLangganan(array $override = []): PaketLangganan
    {
        return PaketLangganan::create(array_merge([
            'nama_paket' => 'Paket Uji',
            'tambahan_hari' => 7,
            'harga' => 50000,
            'status_aktif' => true,
        ], $override));
    }
}