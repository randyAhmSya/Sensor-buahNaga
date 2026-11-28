<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Concerns\BuatDataUji;
use Tests\TestCase;

class ProfilAkunTest extends TestCase
{
    use BuatDataUji;
    use RefreshDatabase;

    public function test_me_memuat_nomor_telepon_dan_data_tenant(): void
    {
        $tenant = $this->buatTenant();
        $user = $this->buatUser($tenant);
        $user->forceFill(['nomor_telepon' => '081234567890'])->save();
        Sanctum::actingAs($user);

        $res = $this->getJson('/api/auth/me')->assertOk();

        $this->assertSame('081234567890', $res->json('data.nomor_telepon'));
        $this->assertSame($tenant->nama_tenant, $res->json('data.tenant.nama_tenant'));
        $this->assertNull($res->json('data.password'));
    }

    public function test_perbarui_profil_menyimpan_nama_hp_dan_nama_kebun(): void
    {
        $tenant = $this->buatTenant();
        $user = $this->buatUser($tenant);
        Sanctum::actingAs($user);

        $this->putJson('/api/auth/profil', [
            'nama_lengkap' => 'Budi Santoso',
            'nomor_telepon' => '0812 3456 7890',
            'nama_tenant' => 'Kebun Naga Jaya',
        ])->assertOk();

        $user->refresh();
        $this->assertSame('Budi Santoso', $user->nama_lengkap);
        $this->assertSame('081234567890', $user->nomor_telepon);
        $this->assertSame('Kebun Naga Jaya', $tenant->fresh()->nama_tenant);
    }

    public function test_email_tidak_bisa_diubah_lewat_profil(): void
    {
        $user = $this->buatUser($this->buatTenant());
        $emailAwal = $user->email;
        Sanctum::actingAs($user);

        $this->putJson('/api/auth/profil', [
            'nama_lengkap' => 'Budi Santoso', 'nomor_telepon' => '081234567890',
            'nama_tenant' => 'Kebun A', 'email' => 'lain@example.com',
        ])->assertOk();

        $this->assertSame($emailAwal, $user->fresh()->email);
    }

    public function test_nomor_hp_tidak_valid_ditolak(): void
    {
        Sanctum::actingAs($this->buatUser($this->buatTenant()));

        $this->putJson('/api/auth/profil', [
            'nama_lengkap' => 'Budi Santoso', 'nomor_telepon' => '123', 'nama_tenant' => 'Kebun A',
        ])->assertStatus(422)->assertJsonValidationErrors('nomor_telepon');
    }

    public function test_ubah_password_berhasil_dengan_password_lama_benar(): void
    {
        $user = $this->buatUser($this->buatTenant()); // password: password123
        Sanctum::actingAs($user);

        $this->putJson('/api/auth/password', [
            'password_lama' => 'password123',
            'password_baru' => 'BaruKuat123',
            'password_baru_confirmation' => 'BaruKuat123',
        ])->assertOk();

        $this->assertTrue(Hash::check('BaruKuat123', $user->fresh()->password));
    }

    public function test_ubah_password_ditolak_bila_password_lama_salah(): void
    {
        $user = $this->buatUser($this->buatTenant());
        Sanctum::actingAs($user);

        $this->putJson('/api/auth/password', [
            'password_lama' => 'salah-total',
            'password_baru' => 'BaruKuat123',
            'password_baru_confirmation' => 'BaruKuat123',
        ])->assertStatus(422)->assertJsonValidationErrors('password_lama');

        $this->assertTrue(Hash::check('password123', $user->fresh()->password));
    }

    public function test_password_baru_lemah_atau_tidak_cocok_ditolak(): void
    {
        Sanctum::actingAs($this->buatUser($this->buatTenant()));

        $this->putJson('/api/auth/password', [
            'password_lama' => 'password123', 'password_baru' => 'lemah',
            'password_baru_confirmation' => 'lemah',
        ])->assertStatus(422)->assertJsonValidationErrors('password_baru');

        $this->putJson('/api/auth/password', [
            'password_lama' => 'password123', 'password_baru' => 'BaruKuat123',
            'password_baru_confirmation' => 'BedaSemua123',
        ])->assertStatus(422)->assertJsonValidationErrors('password_baru');
    }

    public function test_endpoint_profil_butuh_login(): void
    {
        $this->putJson('/api/auth/profil', [])->assertStatus(401);
        $this->putJson('/api/auth/password', [])->assertStatus(401);
    }
}
