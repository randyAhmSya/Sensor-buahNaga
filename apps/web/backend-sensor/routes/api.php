<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Auth\ProfilController;
use App\Http\Controllers\WebhookMidtransController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:5,1')->post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect'])->middleware('throttle:20,1');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->middleware('throttle:20,1');
Route::post('/auth/google/tukar', [GoogleAuthController::class, 'tukar'])->middleware('throttle:10,1');
Route::middleware('auth:sanctum')->post('/auth/lengkapi-profil', [GoogleAuthController::class, 'lengkapiProfil']);

Route::middleware('auth:sanctum')->post('/auth/logout', [AuthController::class, 'logout']);

Route::post('webhook/midtrans', [WebhookMidtransController::class, 'handle']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [ProfilController::class, 'saya']);
    Route::put('/auth/profil', [ProfilController::class, 'perbarui']);
    Route::put('/auth/password', [ProfilController::class, 'ubahPassword'])->middleware('throttle:5,1');
});
