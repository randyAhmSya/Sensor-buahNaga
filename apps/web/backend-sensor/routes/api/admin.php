<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Nanti kita akan tambahkan middleware: ->middleware(['auth:sanctum', 'role:super_admin'])
Route::prefix('super-admin')->group(function () {

    // URL: http://127.0.0.1:8000/api/super-admin/statistik
    Route::get('/statistik', function () {
        return response()->json([
            'status' => 'sukses',
            'pesan' => 'Selamat datang di Dashboard Super Admin AgroLight',
            'data' => [
                'total_petani_aktif' => 150,
                'total_gateway_online' => 45
            ]
        ]);
    });
});
