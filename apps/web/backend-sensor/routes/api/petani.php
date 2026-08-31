<?php

use App\Http\Controllers\petani\BlokController;
use App\Http\Controllers\petani\KebunController;
use App\Http\Controllers\petani\TenantAccessController;
use Illuminate\Support\Facades\Route;

Route::patch('/tenant/toggle-admin-access', [TenantAccessController::class, 'toggleAccess']);

Route::apiResource('kebun', KebunController::class);
Route::apiResource('blok', BlokController::class);
Route::apiResource('node', NodeController::class);
