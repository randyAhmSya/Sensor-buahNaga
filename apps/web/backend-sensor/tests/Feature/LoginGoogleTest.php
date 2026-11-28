<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\GoogleAuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Testing\TestResponse;
use Laravel\Sanctum\Sanctum;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as GoogleUser;
use Mockery;
use Tests\Feature\Concerns\BuatDataUji;
use Tests\TestCase;

/**
 * Login Google: email terdaftar langsung masuk, email baru dibuatkan akun petani
 * (profil belum lengkap), superadmin ditolak. Google dipalsukan lewat mock Socialite.
 */
class LoginGoogleTest extends TestCase
{
    use BuatDataUji;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.google.frontend_url' => 'http://fe.test']);
    }

    private function akunGoogle(string $email, string $id = 'g-1', bool $verified = true): void
    {
        $g = new GoogleUser;
        $g->map(['id' => $id, 'name' => 'Budi Tani', 'email' => $email, 'avatar' => 'http://img.test/a.jpg']);
        $g->user = ['email_verified' => $verified];

        $provider = Mockery::mock(Provider::class);
        $provider->shouldReceive('stateless')->andReturnSelf();
        $provider->shouldReceive('user')->andReturn($g);
        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);
    }

    private function panggilCallback(string $state = 'st-ok'): TestResponse
    {
        Cache::put('google_state:'.$state, true, 600);

        return $this->get('/api/auth/google/callback?code=abc&state='.$state);
    }

    private function paramRedirect(TestResponse $res): array
    {
        parse_str((string) parse_url($res->headers->get('Location'), PHP_URL_QUERY), $q);

        return $q;
    }

    public function test_email_terdaftar_langsung_login_dan_google_id_tertaut(): void
    {
        $user = $this->buatUser($this->buatTenant());
        $this->akunGoogle($user->email, 'g-77');

        $res = $this->panggilCallback();

        $res->assertRedirect();
        $this->assertStringStartsWith('http://fe.test/auth/google/callback?', $res->headers->get('Location'));
        $kode = $this->paramRedirect($res)['kode'];

        $tukar = $this->postJson('/api/auth/google/tukar', ['kode' => $kode])->assertOk();
        $this->assertNotEmpty($tukar->json('data.token'));
        $this->assertSame($user->id, $tukar->json('data.user.id'));
        $this->assertSame('g-77', $user->fresh()->google_id);
        $this->assertTrue($user->fresh()->profil_lengkap);
    }

    public function test_email_baru_dibuatkan_akun_petani_dengan_profil_belum_lengkap(): void
    {
        $this->akunGoogle('baru@gmail.com', 'g-new');

        $kode = $this->paramRedirect($this->panggilCallback())['kode'];
        $res = $this->postJson('/api/auth/google/tukar', ['kode' => $kode])->assertOk();

        $user = User::where('email', 'baru@gmail.com')->first();
        $this->assertNotNull($user);
        $this->assertSame('petani_biasa', $user->role);
        $this->assertFalse($user->profil_lengkap);
        $this->assertNotNull($user->tenant_id);
        $this->assertSame('petani_biasa', $res->json('data.role'));
    }

    public function test_profil_belum_lengkap_memblokir_endpoint_petani_sampai_dilengkapi(): void
    {
        $this->akunGoogle('baru@gmail.com', 'g-new');
        $kode = $this->paramRedirect($this->panggilCallback())['kode'];
        $token = $this->postJson('/api/auth/google/tukar', ['kode' => $kode])->json('data.token');
        $h = ['Authorization' => 'Bearer '.$token];

        $this->getJson('/api/petani/kebun', $h)->assertStatus(403)->assertJsonPath('kode', 'PROFIL_BELUM_LENGKAP');

        $this->postJson('/api/auth/lengkapi-profil', ['nama_tenant' => 'Kebun Naga Jaya', 'nomor_telepon' => '081234567890'], $h)
            ->assertOk();

        $user = User::where('email', 'baru@gmail.com')->first();
        $this->assertTrue($user->profil_lengkap);
        $this->assertSame('081234567890', $user->nomor_telepon);
        $this->assertSame('Kebun Naga Jaya', $user->tenant->nama_tenant);

        $this->getJson('/api/petani/kebun', $h)->assertJsonMissing(['kode' => 'PROFIL_BELUM_LENGKAP']);
    }

    public function test_nomor_hp_tidak_valid_ditolak(): void
    {
        $user = $this->buatUser($this->buatTenant());
        $user->forceFill(['profil_lengkap' => false])->save();
        Sanctum::actingAs($user);

        $this->postJson('/api/auth/lengkapi-profil', ['nama_tenant' => 'X', 'nomor_telepon' => '12345'])
            ->assertStatus(422);
    }

    public function test_superadmin_ditolak(): void
    {
        $admin = $this->buatUser(null, 'superAdmin');
        $this->akunGoogle($admin->email);

        $res = $this->panggilCallback();

        $this->assertSame('superadmin_tidak_diizinkan', $this->paramRedirect($res)['google_error']);
        $this->assertStringStartsWith('http://fe.test/login?', $res->headers->get('Location'));
    }

    public function test_akun_nonaktif_ditolak(): void
    {
        $user = $this->buatUser($this->buatTenant());
        $user->forceFill(['is_aktif' => false])->save();
        $this->akunGoogle($user->email);

        $this->assertSame('akun_nonaktif', $this->paramRedirect($this->panggilCallback())['google_error']);
    }

    public function test_email_google_belum_terverifikasi_ditolak(): void
    {
        $this->akunGoogle('x@gmail.com', 'g-x', false);

        $this->assertSame('email_belum_terverifikasi', $this->paramRedirect($this->panggilCallback())['google_error']);
        $this->assertNull(User::where('email', 'x@gmail.com')->first());
    }

    public function test_akun_google_lain_pada_email_yang_sama_ditolak(): void
    {
        $user = $this->buatUser($this->buatTenant());
        $user->forceFill(['google_id' => 'g-asli'])->save();
        $this->akunGoogle($user->email, 'g-penyusup');

        $this->assertSame('akun_google_berbeda', $this->paramRedirect($this->panggilCallback())['google_error']);
    }

    public function test_state_tidak_valid_ditolak_tanpa_menyentuh_google(): void
    {
        Socialite::shouldReceive('driver')->never();

        $res = $this->get('/api/auth/google/callback?code=abc&state=palsu');

        $this->assertSame('state_tidak_valid', $this->paramRedirect($res)['google_error']);
    }

    public function test_state_hanya_bisa_dipakai_sekali(): void
    {
        $user = $this->buatUser($this->buatTenant());
        $this->akunGoogle($user->email);

        $this->panggilCallback('st-1');
        $ulang = $this->get('/api/auth/google/callback?code=abc&state=st-1');

        $this->assertSame('state_tidak_valid', $this->paramRedirect($ulang)['google_error']);
    }

    public function test_kode_hanya_bisa_ditukar_sekali(): void
    {
        $user = $this->buatUser($this->buatTenant());
        $this->akunGoogle($user->email);
        $kode = $this->paramRedirect($this->panggilCallback())['kode'];

        $this->postJson('/api/auth/google/tukar', ['kode' => $kode])->assertOk();
        $this->postJson('/api/auth/google/tukar', ['kode' => $kode])->assertStatus(401);
    }

    public function test_pengguna_membatalkan_di_halaman_google(): void
    {
        $res = $this->get('/api/auth/google/callback?error=access_denied');

        $this->assertSame('dibatalkan', $this->paramRedirect($res)['google_error']);
    }

    public function test_redirect_menolak_app_redirect_tidak_diizinkan_bukan_jatuh_ke_web(): void
    {
        config(['services.google.izinkan_expo' => false]);

        $this->get('/api/auth/google/redirect?app_redirect='.urlencode('exp://192.168.1.2:8081/--/auth/google'))
            ->assertStatus(422);
    }

    public function test_state_mobile_mengembalikan_hasil_ke_deep_link_aplikasi(): void
    {
        $user = $this->buatUser($this->buatTenant());
        $this->akunGoogle($user->email);
        Cache::put('google_state:st-app', ['app' => 'agrolight://auth/google'], 600);

        $res = $this->get('/api/auth/google/callback?code=abc&state=st-app');

        $this->assertStringStartsWith('agrolight://auth/google?kode=', $res->headers->get('Location'));
    }

    public function test_error_pada_alur_mobile_juga_kembali_ke_aplikasi(): void
    {
        $admin = $this->buatUser(null, 'superAdmin');
        $this->akunGoogle($admin->email);
        Cache::put('google_state:st-app', ['app' => 'agrolight://auth/google'], 600);

        $res = $this->get('/api/auth/google/callback?code=abc&state=st-app');

        $this->assertStringStartsWith('agrolight://auth/google?', $res->headers->get('Location'));
        $this->assertSame('superadmin_tidak_diizinkan', $this->paramRedirect($res)['google_error']);
    }

    public function test_hanya_deep_link_aplikasi_yang_diterima(): void
    {
        $g = app(GoogleAuthService::class);

        $this->assertTrue($g->urlAppValid('agrolight://auth/google'));
        $this->assertFalse($g->urlAppValid('https://penipu.example/ambil'));
        $this->assertFalse($g->urlAppValid('javascript:alert(1)'));
        $this->assertFalse($g->urlAppValid('exp://192.168.1.5:8081/--/auth/google'));

        config(['services.google.izinkan_expo' => true]);
        $this->assertTrue($g->urlAppValid('exp://192.168.1.5:8081/--/auth/google'));
    }

    public function test_state_dengan_tujuan_tidak_valid_diabaikan(): void
    {
        $g = app(GoogleAuthService::class);

        $state = $g->buatState('https://penipu.example/ambil');

        $this->assertSame(['app' => null], $g->pakaiState($state));
    }
}
