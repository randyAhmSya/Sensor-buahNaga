<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\WebhookMidtransController;

Route::middleware('throttle:5,1')->post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->post('/auth/logout', [AuthController::class, 'logout']);

Route::post('webhook/midtrans', [WebhookMidtransController::class, 'handle']);

Route::middleware('auth:sanctum')->get('/auth/me', function (Request $request) {
    return response()->json([
        'status' => 'success',
        'data' => $request->user()
    ]);
});
