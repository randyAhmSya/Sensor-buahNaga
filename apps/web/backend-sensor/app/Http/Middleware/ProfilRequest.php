<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Alat ukur sementara: catat durasi, jumlah query, dan waktu query tiap request API.
 * Aktif hanya kalau PROFIL_REQUEST=true di .env (lihat config/profil.php).
 * Hasil muncul di header "Server-Timing" (DevTools → Network → Timing) dan di storage/logs.
 */
class ProfilRequest
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!config('profil.aktif')) {
            return $next($request);
        }

        $mulai = microtime(true);
        $jumlahQuery = 0;
        $waktuQueryMs = 0.0;
        $queryLambat = [];
        $batasLambatMs = (float) config('profil.query_lambat_ms', 100);

        DB::listen(function ($query) use (&$jumlahQuery, &$waktuQueryMs, &$queryLambat, $batasLambatMs) {
            $jumlahQuery++;
            $waktuQueryMs += $query->time;

            if ($query->time >= $batasLambatMs) {
                $queryLambat[] = ['ms' => round($query->time, 1), 'sql' => $query->sql];
            }
        });

        $response = $next($request);

        $handlerMs = (microtime(true) - $mulai) * 1000;
        $totalMs = defined('LARAVEL_START') ? (microtime(true) - LARAVEL_START) * 1000 : $handlerMs;
        $bootMs = max(0, $totalMs - $handlerMs);

        $response->headers->set(
            'Server-Timing',
            sprintf(
                'total;dur=%.1f, boot;dur=%.1f, app;dur=%.1f, db;dur=%.1f;desc="%d query"',
                $totalMs,
                $bootMs,
                $handlerMs,
                $waktuQueryMs,
                $jumlahQuery
            )
        );

        Log::info('profil_request', [
            'metode'       => $request->method(),
            'path'         => $request->path(),
            'status'       => $response->getStatusCode(),
            'total_ms'     => round($totalMs, 1),
            'boot_ms'      => round($bootMs, 1),
            'app_ms'       => round($handlerMs, 1),
            'db_ms'        => round($waktuQueryMs, 1),
            'jumlah_query' => $jumlahQuery,
            'query_lambat' => $queryLambat,
        ]);

        return $response;
    }
}