<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Akun hasil login Google wajib melengkapi nama kebun & nomor HP dulu
 * sebelum memakai endpoint petani.
 */
class EnsureProfilLengkap
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->profil_lengkap === false) {
            return response()->json([
                'status' => 'error',
                'pesan' => 'Lengkapi profil (nama kebun dan nomor HP) terlebih dahulu.',
                'kode' => 'PROFIL_BELUM_LENGKAP',
            ], 403);
        }

        return $next($request);
    }
}
