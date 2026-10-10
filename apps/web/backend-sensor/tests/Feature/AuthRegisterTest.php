<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthRegisterTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_membuat_tenant_baru_dan_user_dengan_role_petani_biasa(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'nama_tenant' => 'Kebun Baru',
            'nama_lengkap' => 'Petani Baru',
            'email' => 'petani-baru@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201);

        $user = User::where('email', 'petani-baru@example.com')->first();
        $this->assertNotNull($user);
        $this->assertSame('petani_biasa', $user->role);
        $this->assertNotNull($user->tenant_id);

        $tenant = Tenant::find($user->tenant_id);
        $this->assertSame('Kebun Baru', $tenant->nama_tenant);
    }

    public function test_register_mengabaikan_role_yang_dikirim_client(): void
    {
        $this->postJson('/api/auth/register', [
            'nama_tenant' => 'Kebun Nakal',
            'nama_lengkap' => 'Petani Nakal',
            'email' => 'petani-nakal@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'superAdmin', // ini yang dicoba disusupin
        ])->assertStatus(201);

        $user = User::where('email', 'petani-nakal@example.com')->first();
        $this->assertSame('petani_biasa', $user->role);
    }

    public function test_register_mengabaikan_tenant_id_yang_dikirim_client(): void
    {
        $tenantLain = Tenant::create([
            'nama_tenant' => 'Tenant Korban',
            'paket_langganan' => 'gratis',
        ]);

        $this->postJson('/api/auth/register', [
            'nama_tenant' => 'Kebun Nyusup',
            'nama_lengkap' => 'Petani Nyusup',
            'email' => 'petani-nyusup@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'tenant_id' => $tenantLain->tenant_id, // nyoba numpang ke tenant orang
        ])->assertStatus(201);

        $user = User::where('email', 'petani-nyusup@example.com')->first();
        $this->assertNotSame($tenantLain->tenant_id, $user->tenant_id);
    }

    public function test_email_yang_sudah_terdaftar_ditolak(): void
    {
        $this->postJson('/api/auth/register', [
            'nama_tenant' => 'Kebun 1', 'nama_lengkap' => 'Petani 1',
            'email' => 'dobel@example.com',
            'password' => 'password123', 'password_confirmation' => 'password123',
        ])->assertStatus(201);

        $this->postJson('/api/auth/register', [
            'nama_tenant' => 'Kebun 2', 'nama_lengkap' => 'Petani 2',
            'email' => 'dobel@example.com',
            'password' => 'password123', 'password_confirmation' => 'password123',
        ])->assertStatus(422);
    }

    public function test_password_tidak_cocok_dengan_konfirmasi_ditolak(): void
    {
        $this->postJson('/api/auth/register', [
            'nama_tenant' => 'Kebun Gagal', 'nama_lengkap' => 'Petani Gagal',
            'email' => 'gagal@example.com',
            'password' => 'password123', 'password_confirmation' => 'beda123',
        ])->assertStatus(422);
    }
}