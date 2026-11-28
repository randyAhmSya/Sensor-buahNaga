<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use App\Services\GoogleAuthService;
use App\Traits\ApiResponser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class GoogleAuthController extends Controller
{
    use ApiResponser;

    public function __construct(
        protected GoogleAuthService $google,
        protected AuthService $authService
    ) {}

    public function redirect(Request $request)
    {
        // Aplikasi mobile mengirim app_redirect. Bila ditolak (mis. exp:// Expo Go saat
        // GOOGLE_IZINKAN_EXPO=false), jangan diam-diam jatuh ke website: beri tahu jelas.
        $appRedirect = $request->query('app_redirect');
        if ($appRedirect !== null && ! $this->google->urlAppValid($appRedirect)) {
            return response()->json([
                'status' => 'error',
                'pesan' => 'app_redirect tidak diizinkan. Untuk Expo Go set GOOGLE_IZINKAN_EXPO=true di .env backend lalu php artisan config:clear; untuk APK pakai skema agrolight://.',
            ], 422);
        }

        return Socialite::driver('google')
            ->stateless()
            ->with([
                'state' => $this->google->buatState($request->query('app_redirect')),
                'prompt' => 'select_account',
            ])
            ->redirect();
    }

    public function callback(Request $request)
    {
        // State dipakai lebih dulu agar kita tahu tujuan kembali (web atau aplikasi mobile)
        $konteks = $this->google->pakaiState($request->query('state'));
        $app = $konteks['app'] ?? null;

        if ($request->query('error')) {
            return $this->kembali(['google_error' => 'dibatalkan'], $app);
        }

        if ($konteks === null) {
            return $this->kembaliKeFrontend(['google_error' => 'state_tidak_valid']);
        }

        try {
            $akunGoogle = Socialite::driver('google')->stateless()->user();
        } catch (Throwable $e) {
            Log::warning('Login Google gagal: '.$e->getMessage());

            return $this->kembali(['google_error' => 'gagal_google'], $app);
        }

        [$user, $error] = $this->google->selesaikan($akunGoogle);

        if (! $user) {
            return $this->kembali(['google_error' => $error], $app);
        }

        return $this->kembali(['kode' => $this->google->buatKode($user)], $app);
    }

    /** Front-end menukar kode satu kali pakai dengan token Sanctum. */
    public function tukar(Request $request)
    {
        $data = $request->validate(['kode' => 'required|string|max:100']);

        $user = $this->google->tukarKode($data['kode']);

        if (! $user) {
            return $this->errorResponse('Kode login Google tidak valid atau sudah kedaluwarsa.', 401);
        }
        if (! $user->is_aktif) {
            return $this->errorResponse('Akun ini dinonaktifkan. Hubungi admin AgroLight.', 403);
        }

        return $this->successResponse([
            'user' => $user,
            'role' => $user->role,
            'token' => $this->authService->createNewToken($user),
        ], 'Login Google sukses.');
    }

    public function lengkapiProfil(Request $request)
    {
        // Rapikan dulu: spasi dan tanda hubung dibuang sebelum divalidasi
        if (is_string($request->input('nomor_telepon'))) {
            $request->merge(['nomor_telepon' => preg_replace('/[\s-]/', '', $request->input('nomor_telepon'))]);
        }

        $data = $request->validate([
            'nama_tenant' => 'required|string|max:100',
            'nomor_telepon' => ['required', 'string', 'regex:/^(\+62|62|0)8[0-9]{7,12}$/'],
        ], [
            'nomor_telepon.regex' => 'Nomor HP tidak valid. Contoh: 081234567890.',
        ]);

        $user = $request->user();

        DB::transaction(function () use ($user, $data) {
            if ($user->tenant) {
                $user->tenant->update(['nama_tenant' => $data['nama_tenant']]);
            }
            $user->forceFill([
                'nomor_telepon' => $data['nomor_telepon'],
                'profil_lengkap' => true,
            ])->save();
        });

        return $this->successResponse($user->fresh(), 'Profil berhasil dilengkapi.');
    }

    /** Kembalikan hasil ke aplikasi mobile (deep link) bila diminta, selain itu ke web. */
    private function kembali(array $query, ?string $appRedirect)
    {
        if ($appRedirect) {
            $pemisah = str_contains($appRedirect, '?') ? '&' : '?';

            return redirect()->away($appRedirect.$pemisah.http_build_query($query));
        }

        return $this->kembaliKeFrontend($query);
    }

    private function kembaliKeFrontend(array $query)
    {
        $base = rtrim((string) config('services.google.frontend_url'), '/');

        if (isset($query['kode'])) {
            return redirect()->away($base.'/auth/google/callback?'.http_build_query($query));
        }

        return redirect()->away($base.'/login?'.http_build_query($query));
    }
}
