<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',

        then: function () {
            Route::middleware(['api', 'auth:sanctum'])
                ->prefix('api/admin')
                ->name('admin.')
                ->group(base_path('routes/api/admin.php'));

            Route::middleware(['api', 'auth:sanctum'])
                ->prefix('api/petani')
                ->name('petani.')
                ->group(base_path('routes/api/petani.php'));

            Route::middleware('api')
                ->prefix('api/iot')
                ->name('iot.')
                ->group(base_path('routes/api/iot.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'superAdmin' => \App\Http\Middleware\EnsureIsSuperAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn(Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
