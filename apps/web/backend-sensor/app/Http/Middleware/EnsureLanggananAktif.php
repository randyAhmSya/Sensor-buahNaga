<?php

namespace App\Http\Middleware;

use App\Services\management_langganan\LanggananService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureLanggananAktif
{
    public function __construct(protected LanggananService $langgananService) {}

    public function handle(Request $request, Closure $next): Response
    {
        $tenantId = $request->user()?->tenant_id;

        if (!$tenantId) {
            return response()->json([
                'status' => 'error',
                'pesan' => 'Akun ini tidak terhubung ke tenant.',
            ], 403);
        }

        // Saklar: kalau langganan tidak diwajibkan (LANGGANAN_WAJIB=false), semua tenant
        // yang valid boleh memakai fitur tanpa cek status/kadaluarsa. Logika langganan
        // di bawah tetap utuh dan aktif lagi begitu LANGGANAN_WAJIB=true.
        if (!config('langganan.wajib', true)) {
            return $next($request);
        }

        $status = $this->langgananService->getStatus($tenantId)->statusEfektif();

        if ($status === 'kadaluarsa') {
            return response()->json([
                'status' => 'error',
                'pesan' => 'Langganan sudah habis dan masa tenggang sudah lewat. Silakan beli paket untuk melanjutkan.',
            ], 402);
        }

        return $next($request);
    }
}