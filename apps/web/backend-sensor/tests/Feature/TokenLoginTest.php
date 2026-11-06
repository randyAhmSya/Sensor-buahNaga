<?php

namespace Tests\Feature;

use App\Services\AuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Concerns\BuatDataUji;
use Tests\TestCase;

/**
 * Token login: berlaku 1 hari dan dibatasi N perangkat (token terlama tergeser).
 * Membutuhkan perubahan AuthService::createNewToken dan config/sanctum.php
 * (masa_token_menit, maks_token_per_user).
 */
class TokenLoginTest extends TestCase
{
    use RefreshDatabase;
    use BuatDataUji;

    public function test_token_dibatasi_dua_perangkat_dan_berlaku_satu_hari(): void
    {
        config(['sanctum.maks_token_per_user' => 2, 'sanctum.masa_token_menit' => 1440]);
        $user = $this->buatUser($this->buatTenant());
        $svc = app(AuthService::class);

        $idPertama = (int) explode('|', $svc->createNewToken($user))[0];
        $svc->createNewToken($user);
        $svc->createNewToken($user);

        $tokens = $user->tokens()->get();
        $this->assertCount(2, $tokens);
        $this->assertNotContains($idPertama, $tokens->pluck('id')->all(), 'Token terlama harus tergeser.');

        foreach ($tokens as $t) {
            $this->assertNotNull($t->expires_at);
            $this->assertEqualsWithDelta(now()->addDay()->timestamp, $t->expires_at->timestamp, 5);
        }
    }

    public function test_batas_satu_perangkat_menghapus_semua_token_lama(): void
    {
        config(['sanctum.maks_token_per_user' => 1]);
        $user = $this->buatUser($this->buatTenant());
        $svc = app(AuthService::class);

        $svc->createNewToken($user);
        $svc->createNewToken($user);

        $this->assertCount(1, $user->tokens()->get());
    }

    public function test_token_kedaluwarsa_ditolak_401(): void
    {
        config(['sanctum.maks_token_per_user' => 2, 'sanctum.masa_token_menit' => 1440]);
        $user = $this->buatUser($this->buatTenant());

        $plain = app(AuthService::class)->createNewToken($user);

        $this->travel(25)->hours();

        $this->withHeader('Authorization', 'Bearer ' . $plain)
            ->getJson('/api/petani/kebun')
            ->assertStatus(401);
    }
}