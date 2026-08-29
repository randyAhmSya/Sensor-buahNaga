<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureIsSuperAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->role !== 'superAdmin') {
            return response()->json([
                'status' => 'error',
                'pesan'  => 'Akses ditolak. Endpoint ini hanya untuk Super Admin.',
            ], 403);
        }

        return $next($request);
    }
}
