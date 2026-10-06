<?php

use App\Http\Controllers\petani\AutoDimmingController;
use App\Http\Controllers\petani\BlokController;
use App\Http\Controllers\petani\GatewayController;
use App\Http\Controllers\petani\JadwalLampuController;
use App\Http\Controllers\petani\KebunController;
use App\Http\Controllers\petani\KodeQrController;
use App\Http\Controllers\petani\LanggananController;
use App\Http\Controllers\petani\LogEnergyController;
use App\Http\Controllers\petani\NodeController;
use App\Http\Controllers\petani\SiklusPanenController;
use App\Http\Controllers\petani\TelemetriController;
use App\Http\Controllers\petani\TenantAccessController;
use App\Http\Middleware\EnsureLanggananAktif;
use App\Http\Middleware\EnsureTenantAktif;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\petani\BlokStatusController;
use App\Http\Controllers\petani\NotifikasiController;

// ===== Selalu bisa diakses, walau langganan habis =====
Route::patch('/tenant/toggle-admin-access', [TenantAccessController::class, 'toggleAccess']);
Route::post('/gateway/pair', [GatewayController::class, 'pair'])->middleware('throttle:10,1')->withoutMiddleware('auth:sanctum');

Route::prefix('langganan')->middleware(['auth:sanctum', EnsureTenantAktif::class])->group(function () {
    Route::get('paket', [LanggananController::class, 'paket']);
    Route::get('status', [LanggananController::class, 'status']);
    Route::get('riwayat', [LanggananController::class, 'riwayat']);
    Route::post('beli', [LanggananController::class, 'ajukanPembelian']);
    Route::get('transaksi/{id}/bukti-transfer', [LanggananController::class, 'buktiTransfer']);
});

Route::prefix('notifikasi')->middleware(['auth:sanctum', EnsureTenantAktif::class])->group(function () {
    Route::get('/', [NotifikasiController::class, 'index']);
    Route::patch('{id}/dibaca', [NotifikasiController::class, 'tandaiDibaca'])->whereUuid('id');
    Route::patch('tandai-semua-dibaca', [NotifikasiController::class, 'tandaiSemuaDibaca']);
});

// ===== Butuh langganan aktif =====
Route::middleware(['auth:sanctum', EnsureTenantAktif::class, EnsureLanggananAktif::class])->group(function () {
    Route::apiResource('kebun', KebunController::class);
    Route::apiResource('blok', BlokController::class);
    Route::post('/node/{id}/generate-qr', [NodeController::class, 'generateNewQr']);
    Route::apiResource('node', NodeController::class);
    Route::apiResource('gateway', GatewayController::class);
    Route::apiResource('qr', KodeQrController::class)->except(['update', 'destroy']);
    Route::post('qr/scan', [KodeQrController::class, 'scan']);
    Route::apiResource('siklus-panen', SiklusPanenController::class);
    Route::get('jadwal-lampu/aktif', [JadwalLampuController::class, 'aktif']);
    Route::apiResource('jadwal-lampu', JadwalLampuController::class);
    Route::post('sensor/{sensorId}/dimming', [AutoDimmingController::class, 'hitung']);
    Route::get('telemetri', [TelemetriController::class, 'index']);
    Route::get('log-energy', [LogEnergyController::class, 'index']);
    Route::get('blok/{id}/status-lampu', [BlokStatusController::class, 'statusLampu']);
});