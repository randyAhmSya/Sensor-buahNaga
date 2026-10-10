<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SetupSanityTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_lalu_login_bisa_akses_endpoint_terproteksi(): void
    {
        $registerResponse = $this->postJson('/api/auth/register', [
            'nama_tenant' => 'Kebun Tes',
            'nama_lengkap' => 'Petani Tes',
            'email' => 'petani-tes@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $registerResponse->assertStatus(201);

        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => 'petani-tes@example.com',
            'password' => 'password123',
        ]);

        $loginResponse->assertStatus(200);
        $token = $loginResponse->json('data.token');
        $this->assertNotEmpty($token);

        $statusResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/petani/langganan/status');

        $statusResponse->assertStatus(200);
        $statusResponse->assertJsonPath('data.status_langganan', 'aktif');
        $statusResponse->assertJsonPath('data.sisa_hari', 7);
    }
}