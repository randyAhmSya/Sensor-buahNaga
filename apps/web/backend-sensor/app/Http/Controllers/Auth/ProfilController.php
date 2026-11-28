<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\Password;
use Laravel\Sanctum\PersonalAccessToken;

/**
 * Profil milik pengguna yang sedang login: data akun, nama kebun, dan kata sandi.
 */
class ProfilController extends Controller
{
    use ApiResponser;

    public function saya(Request $request)
    {
        return $this->successResponse($this->muat($request), 'Profil berhasil diambil.');
    }

    public function perbarui(Request $request)
    {
        // Rapikan dulu: spasi dan tanda hubung dibuang sebelum divalidasi
        if (is_string($request->input('nomor_telepon'))) {
            $request->merge(['nomor_telepon' => preg_replace('/[\s-]/', '', $request->input('nomor_telepon'))]);
        }

        $user = $request->user();
        $punyaTenant = $user->role !== 'superAdmin' && $user->tenant;

        $data = $request->validate([
            'nama_lengkap' => 'required|string|min:3|max:60',
            'nomor_telepon' => ['required', 'string', 'regex:/^(\+62|62|0)8[0-9]{7,12}$/'],
            'nama_tenant' => [$punyaTenant ? 'required' : 'prohibited', 'string', 'max:100'],
        ], [
            'nomor_telepon.regex' => 'Nomor HP tidak valid. Contoh: 081234567890.',
        ]);

        DB::transaction(function () use ($user, $data, $punyaTenant) {
            $user->forceFill([
                'nama_lengkap' => strip_tags($data['nama_lengkap']),
                'nomor_telepon' => $data['nomor_telepon'],
            ])->save();

            if ($punyaTenant) {
                $user->tenant->update(['nama_tenant' => strip_tags($data['nama_tenant'])]);
            }
        });

        return $this->successResponse($this->muat($request), 'Profil berhasil diperbarui.');
    }

    public function ubahPassword(Request $request)
    {
        $data = $request->validate([
            'password_lama' => 'required|string|current_password:sanctum',
            'password_baru' => [
                'required', 'string', 'confirmed', 'different:password_lama',
                Password::min(8)->mixedCase()->numbers(),
            ],
        ], [
            'password_lama.current_password' => 'Password lama salah.',
            'password_baru.different' => 'Password baru tidak boleh sama dengan password lama.',
            'password_baru.confirmed' => 'Konfirmasi password baru tidak cocok.',
        ]);

        $user = $request->user();
        $user->forceFill(['password' => $data['password_baru']])->save(); // di-hash oleh cast

        // Keluarkan perangkat lain; sesi yang sedang dipakai tetap aktif.
        $sekarang = $user->currentAccessToken();
        if ($sekarang instanceof PersonalAccessToken) {
            $user->tokens()->where('id', '!=', $sekarang->id)->delete();
        }

        return $this->successResponse(null, 'Password berhasil diperbarui.');
    }

    private function muat(Request $request)
    {
        return $request->user()->fresh()->load('tenant:tenant_id,nama_tenant,is_admin_allowed');
    }
}
