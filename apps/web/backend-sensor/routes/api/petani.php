<?php

use App\Http\Controllers\petani\BlokController;
use App\Http\Controllers\petani\KebunController;
use App\Http\Controllers\petani\TenantAccessController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\petani\NodeController;
use App\Http\Controllers\petani\GatewayController;
use App\Http\Controllers\petani\KodeQrController;

Route::patch('/tenant/toggle-admin-access', [TenantAccessController::class, 'toggleAccess']);

Route::apiResource('kebun', KebunController::class);
Route::apiResource('blok', BlokController::class);
Route::post('/node/{id}/generate-qr', [NodeController::class, 'generateNewQr']);
Route::apiResource('node', NodeController::class);
Route::apiResource('gateway', GatewayController::class);
Route::apiResource('qr', KodeQrController::class);
