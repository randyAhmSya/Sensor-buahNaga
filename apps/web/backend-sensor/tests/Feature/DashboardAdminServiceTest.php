<?php

namespace Tests\Feature\management_admin;

use App\Models\Tenant;
use App\Models\User;
use App\Models\Kebun;
use App\Models\Blok;
use App\Models\Gateway;
use App\Models\NodeSensor;
use App\Models\TransaksiLangganan;
use App\Models\LogAktivitasAdmin;
use App\Models\LanggananTenant;
use App\Services\management_admin\DashboardAdminService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Tests\TestCase;

class DashboardAdminServiceTest extends TestCase
{
    use RefreshDatabase;

    private DashboardAdminService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new DashboardAdminService();
    }

    private function buatTenant(array $overrides = []): Tenant
    {
        return Tenant::create(array_merge([
            'tenant_id'   => (string) Str::uuid(),
            'nama_tenant' => 'Tenant Uji ' . Str::random(6),
            'is_aktif'    => true,
        ], $overrides));
    }

    private function buatUser(array $overrides = []): User
    {
        return User::create(array_merge([
            'id'           => (string) Str::uuid(),
            'nama_lengkap' => 'User Test',
            'email'        => Str::uuid() . '@test.local',
            'password'     => Hash::make('password'),
            'role'         => 'user',
        ], $overrides));
    }

    public function test_ringkasan_tenant_menghitung_total_aktif_dan_nonaktif(): void
    {
        $this->buatTenant(['is_aktif' => true]);
        $this->buatTenant(['is_aktif' => true]);
        $this->buatTenant(['is_aktif' => true]);
        $this->buatTenant(['is_aktif' => false]);
        $this->buatTenant(['is_aktif' => false]);

        $hasil = $this->service->getRingkasan()['tenant'];

        $this->assertEquals(5, $hasil['total']);
        $this->assertEquals(3, $hasil['aktif']);
        $this->assertEquals(2, $hasil['nonaktif']);
    }

    public function test_ringkasan_user_menghitung_total_aktif_nonaktif_dan_per_role(): void
    {
        $this->buatUser(['role' => 'superadmin', 'is_aktif' => true]);
        $this->buatUser(['role' => 'superadmin', 'is_aktif' => true]);
        $this->buatUser(['role' => 'petani', 'is_aktif' => true]);
        $this->buatUser(['role' => 'petani', 'is_aktif' => true]);
        $this->buatUser(['role' => 'petani', 'is_aktif' => true]);
        $this->buatUser(['role' => 'petani', 'is_aktif' => false]);

        $hasil = $this->service->getRingkasan()['user'];

        $this->assertEquals(6, $hasil['total']);
        $this->assertEquals(5, $hasil['aktif']);
        $this->assertEquals(1, $hasil['nonaktif']);
        $this->assertEquals(2, $hasil['per_role']['superadmin']);
        $this->assertEquals(4, $hasil['per_role']['petani']);
    }

    public function test_ringkasan_transaksi_menghitung_status_dan_pendapatan(): void
    {
        $tenant = $this->buatTenant();

        foreach ([1, 2] as $i) {
            TransaksiLangganan::create([
                'id_transaksi'      => (string) Str::uuid(),
                'tenant_id'         => $tenant->tenant_id,
                'nama_paket'        => 'Paket Uji',
                'tambahan_hari'     => 30,
                'harga'             => 50000,
                'status_pembayaran' => 'diverifikasi',
            ]);
        }

        TransaksiLangganan::create([
            'id_transaksi'      => (string) Str::uuid(),
            'tenant_id'         => $tenant->tenant_id,
            'nama_paket'        => 'Paket Uji',
            'tambahan_hari'     => 30,
            'harga'             => 75000,
            'status_pembayaran' => 'menunggu_pembayaran',
        ]);

        TransaksiLangganan::create([
            'id_transaksi'      => (string) Str::uuid(),
            'tenant_id'         => $tenant->tenant_id,
            'nama_paket'        => 'Paket Uji',
            'tambahan_hari'     => 30,
            'harga'             => 30000,
            'status_pembayaran' => 'ditolak',
        ]);

        $hasil = $this->service->getRingkasan()['transaksi'];

        $this->assertEquals(4, $hasil['total']);
        $this->assertEquals(2, $hasil['diverifikasi']);
        $this->assertEquals(1, $hasil['menunggu_pembayaran']);
        $this->assertEquals(1, $hasil['ditolak']);
        $this->assertEquals(100000.0, $hasil['pendapatan_total']);
    }

    public function test_ringkasan_infrastruktur_menghitung_kebun_blok_gateway_dan_node(): void
    {
        $tenant = $this->buatTenant();

        $kebunAktif = Kebun::create([
            'id_kebun'     => (string) Str::uuid(),
            'tenant_id'    => $tenant->tenant_id,
            'nama_kebun'   => 'Kebun Aktif',
            'status_kebun' => true,
        ]);
        Kebun::create([
            'id_kebun'     => (string) Str::uuid(),
            'tenant_id'    => $tenant->tenant_id,
            'nama_kebun'   => 'Kebun Nonaktif',
            'status_kebun' => false,
        ]);

        $blok1 = Blok::create([
            'id_blok'   => (string) Str::uuid(),
            'kebun_id'  => $kebunAktif->id_kebun,
            'nama_blok' => 'Blok 1',
        ]);
        $blok2 = Blok::create([
            'id_blok'   => (string) Str::uuid(),
            'kebun_id'  => $kebunAktif->id_kebun,
            'nama_blok' => 'Blok 2',
        ]);

        $gateway1 = Gateway::create([
            'id_gateway'     => (string) Str::uuid(),
            'blok_id'        => $blok1->id_blok,
            'kode_perangkat' => 'GW-001',
            'status_koneksi' => 'online',
        ]);
        Gateway::create([
            'id_gateway'     => (string) Str::uuid(),
            'blok_id'        => $blok2->id_blok,
            'kode_perangkat' => 'GW-002',
            'status_koneksi' => 'offline',
        ]);

        NodeSensor::create([
            'id_sensor'      => (string) Str::uuid(),
            'blok_id'        => $blok1->id_blok,
            'gateway_id'     => $gateway1->id_gateway,
            'kode_perangkat' => 'NODE-001',
            'tipe_sensor'    => 'lux',
            'status_koneksi' => 'online',
        ]);

        $hasil = $this->service->getRingkasan()['infrastruktur'];

        $this->assertEquals(2, $hasil['kebun']['total']);
        $this->assertEquals(1, $hasil['kebun']['aktif']);
        $this->assertEquals(1, $hasil['kebun']['nonaktif']);
        $this->assertEquals(2, $hasil['blok']['total']);
        $this->assertEquals(2, $hasil['gateway']['total']);
        $this->assertEquals(1, $hasil['gateway']['per_status']['online']);
        $this->assertEquals(1, $hasil['gateway']['per_status']['offline']);
        $this->assertEquals(1, $hasil['node_sensor']['total']);
        $this->assertEquals(1, $hasil['node_sensor']['per_status']['online']);
        $this->assertEquals(1, $hasil['node_sensor']['per_tipe']['lux']);
    }

    public function test_aktivitas_terbaru_mengembalikan_log_urut_terbaru_dan_dibatasi(): void
    {
        $admin = $this->buatUser(['role' => 'superadmin', 'nama_lengkap' => 'Admin Satu']);

        foreach (range(1, 12) as $i) {
            $log = new LogAktivitasAdmin([
                'id_log'      => (string) Str::uuid(),
                'admin_id'    => $admin->id,
                'aksi'        => 'aksi_ke_' . $i,
                'target_tipe' => 'Tenant',
                'target_id'   => (string) $i,
                'keterangan'  => 'keterangan ke-' . $i,
            ]);
            $log->created_at = Carbon::now()->subMinutes(12 - $i);
            $log->updated_at = $log->created_at;
            $log->save();
        }

        $hasil = $this->service->getRingkasan()['aktivitas_terbaru'];

        $this->assertCount(10, $hasil);
        $this->assertEquals('aksi_ke_12', $hasil->first()['aksi']);
        $this->assertEquals('Admin Satu', $hasil->first()['admin']);
    }

    public function test_ringkasan_langganan_mengelompokkan_status_aktif_tenggang_kadaluarsa(): void
    {
        Config::set('langganan.masa_tenggang_hari', 3);

        $tenantAktif = $this->buatTenant();
        LanggananTenant::create([
            'id_langganan'           => (string) Str::uuid(),
            'tenant_id'              => $tenantAktif->tenant_id,
            'status_langganan'       => 'aktif',
            'sisa_hari'              => 10,
            'tanggal_aktif_terakhir' => Carbon::now(),
        ]);

        $tenantTenggang = $this->buatTenant();
        LanggananTenant::create([
            'id_langganan'           => (string) Str::uuid(),
            'tenant_id'              => $tenantTenggang->tenant_id,
            'status_langganan'       => 'aktif',
            'sisa_hari'              => 10,
            'tanggal_aktif_terakhir' => Carbon::now()->subDays(11),
        ]);

        $tenantKadaluarsa = $this->buatTenant();
        LanggananTenant::create([
            'id_langganan'           => (string) Str::uuid(),
            'tenant_id'              => $tenantKadaluarsa->tenant_id,
            'status_langganan'       => 'aktif',
            'sisa_hari'              => 10,
            'tanggal_aktif_terakhir' => Carbon::now()->subDays(20),
        ]);

        $hasil = $this->service->getRingkasan()['langganan'];

        $this->assertEquals(3, $hasil['total']);
        $this->assertEquals(1, $hasil['aktif']);
        $this->assertEquals(1, $hasil['tenggang']);
        $this->assertEquals(1, $hasil['kadaluarsa']);
    }
}