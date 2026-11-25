<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\WebhookMidtransController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:5,1')->post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect'])->middleware('throttle:20,1');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->middleware('throttle:20,1');
Route::post('/auth/google/tukar', [GoogleAuthController::class, 'tukar'])->middleware('throttle:10,1');
Route::middleware('auth:sanctum')->post('/auth/lengkapi-profil', [GoogleAuthController::class, 'lengkapiProfil']);

Route::middleware('auth:sanctum')->post('/auth/logout', [AuthController::class, 'logout']);

Route::post('webhook/midtrans', [WebhookMidtransController::class, 'handle']);

Route::middleware('auth:sanctum')->get('/auth/me', function (Request $request) {
    return response()->json([
        'status' => 'success',
        'data' => $request->user(),
    ]);
});
