<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantAktif
{
    public function handle(Request $request, Closure $next): Response
    {
        $tenantId = $request->user()?->tenant_id;

        if (!$tenantId) {
            return response()->json([
                'status' => 'error',
                'pesan' => 'Akun ini tidak terhubung ke tenant.',
            ], 403);
        }

        $tenant = Tenant::find($tenantId);

        if (!$tenant || !$tenant->is_aktif) {
            return response()->json([
                'status' => 'error',
                'pesan' => 'Akun tenant ini dinonaktifkan. Hubungi admin AgroLight.',
            ], 403);
        }

        return $next($request);
    }
}
