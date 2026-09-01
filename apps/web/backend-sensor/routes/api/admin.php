<?php

use App\Http\Controllers\petani\BlokController;
use App\Http\Controllers\petani\KebunController;
use App\Http\Controllers\petani\NodeController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\petani\GatewayController;
use App\Http\Controllers\petani\KodeQrController;

Route::middleware('superAdmin')->group(function () {

    Route::apiResource('kebun', KebunController::class)->names('admin.kebun');
    Route::apiResource('blok', BlokController::class);
    Route::apiResource('node', NodeController::class);
    Route::apiResource('gateway', GatewayController::class);
    Route::apiResource('qr', KodeQrController::class);
});
