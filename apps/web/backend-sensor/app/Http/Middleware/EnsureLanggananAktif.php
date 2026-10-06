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