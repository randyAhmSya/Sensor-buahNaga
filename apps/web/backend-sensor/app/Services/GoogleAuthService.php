<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Contracts\User as SocialiteUser;

class GoogleAuthService
{
    public const KODE_TTL_DETIK = 60;

    public const STATE_TTL_DETIK = 600;

    /**
     * Buat state anti-CSRF. $appRedirect (opsional) = alamat deep link aplikasi mobile
     * tempat hasil login dikembalikan; hanya dipakai bila lolos urlAppValid().
     */
    public function buatState(?string $appRedirect = null): string
    {
        $state = Str::random(40);
        Cache::put('google_state:'.$state, [
            'app' => $this->urlAppValid($appRedirect) ? $appRedirect : null,
        ], self::STATE_TTL_DETIK);

        return $state;
    }

    /**
     * State sekali pakai. Mengembalikan konteks (['app' => ?string]) atau null
     * bila tidak ada / kedaluwarsa / sudah dipakai.
     */
    public function pakaiState(?string $state): ?array
    {
        if ($state === null || $state === '') {
            return null;
        }

        $nilai = Cache::pull('google_state:'.$state);

        if ($nilai === true) {
            return ['app' => null];
        }

        return is_array($nilai) ? $nilai : null;
    }

    /**
     * Tujuan deep link mobile yang diizinkan: skema aplikasi (agrolight://).
     * Skema exp:// (Expo Go) hanya bila GOOGLE_IZINKAN_EXPO=true, khusus pengembangan.
     */
    public function urlAppValid(?string $url): bool
    {
        if (! $url || strlen($url) > 300 || preg_match('/[\s<>"\x5C]/', $url)) {
            return false;
        }

        if (str_starts_with($url, 'agrolight://')) {
            return true;
        }

        return (bool) config('services.google.izinkan_expo') && str_starts_with($url, 'exp://');
    }

    /**
     * Cocokkan akun Google dengan user AgroLight.
     *
     * @return array{0: ?User, 1: ?string} [user, kodeError]
     */
    public function selesaikan(SocialiteUser $g): array
    {
        $raw = (array) ($g->user ?? []);
        $terverifikasi = filter_var($raw['email_verified'] ?? $raw['verified_email'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $email = Str::lower((string) $g->getEmail());

        if ($email === '' || ! $terverifikasi) {
            return [null, 'email_belum_terverifikasi'];
        }

        $user = User::where('google_id', $g->getId())->first()
            ?? User::whereRaw('LOWER(email) = ?', [$email])->first(); // email terdaftar bisa berhuruf besar

        if ($user) {
            if ($user->role === 'superAdmin') {
                return [null, 'superadmin_tidak_diizinkan'];
            }
            if (! $user->is_aktif) {
                return [null, 'akun_nonaktif'];
            }
            if ($user->google_id && $user->google_id !== (string) $g->getId()) {
                return [null, 'akun_google_berbeda'];
            }

            $user->forceFill([
                'google_id' => $user->google_id ?? (string) $g->getId(),
                'url_foto' => $user->url_foto ?: $g->getAvatar(),
                'email_verified_at' => $user->email_verified_at ?? now(),
            ])->save();

            return [$user, null];
        }

        $nama = trim((string) ($g->getName() ?: Str::before($email, '@')));

        $user = DB::transaction(function () use ($g, $email, $nama) {
            $tenant = Tenant::create([
                'nama_tenant' => 'Kebun '.$nama, // sementara, diganti saat melengkapi profil
                'paket_langganan' => 'gratis',
            ]);

            return User::create([
                'tenant_id' => $tenant->tenant_id,
                'nama_lengkap' => $nama,
                'email' => $email,
                'password' => Str::random(40), // di-hash oleh cast; login Google tidak memakainya
                'role' => 'petani_biasa',
                'google_id' => (string) $g->getId(),
                'url_foto' => $g->getAvatar(),
                'email_verified_at' => now(),
                'profil_lengkap' => false,
            ]);
        });

        return [$user, null];
    }

    /** Kode satu kali pakai (60 dtk) yang ditukar front-end dengan token. */
    public function buatKode(User $user): string
    {
        $kode = Str::random(48);
        Cache::put('google_kode:'.$kode, $user->id, self::KODE_TTL_DETIK);

        return $kode;
    }

    public function tukarKode(string $kode): ?User
    {
        $id = Cache::pull('google_kode:'.$kode);

        return $id ? User::find($id) : null;
    }
}
