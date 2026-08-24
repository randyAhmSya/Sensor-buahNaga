<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Nanti kita akan tambahkan middleware: ->middleware(['auth:sanctum', 'role:admin_kebun'])
Route::prefix('kebun')->group(function () {

    // URL: http://127.0.0.1:8000/api/kebun/ringkasan
    Route::get('/ringkasan', function () {
        return response()->json([
            'status' => 'sukses',
            'pesan' => 'Data kebun milik Anda berhasil dimuat.',
            'data' => [
                'nama_kebun' => 'Kebun Naga Banyuwangi',
                'status_lampu' => 'MENYALA',
                'prediksi_panen' => '2026-10-15'
            ]
        ]);
    });
});
