<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Rute ini dibiarkan terbuka (tanpa login akun manusia), tapi nanti diproteksi pakai Token Alat
Route::prefix('telemetri')->group(function () {

    // URL: http://127.0.0.1:8000/api/telemetri/terima-sensor
    Route::post('/terima-sensor', function (Request $request) {
        return response()->json([
            'status' => 'berhasil',
            'pesan' => 'Data cahaya masuk!',
            'data_diterima' => $request->all()
        ], 201);
    });
});
