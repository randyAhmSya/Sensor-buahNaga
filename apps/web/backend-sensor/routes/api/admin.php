    <?php

    use App\Http\Controllers\petani\BlokController;
    use App\Http\Controllers\petani\KebunController;
    use App\Http\Controllers\petani\NodeController;
    use Illuminate\Support\Facades\Route;
    use App\Http\Controllers\petani\GatewayController;
    use App\Http\Controllers\petani\KodeQrController;
    use App\Http\Controllers\admin\LanggananAdminController;
    use App\Http\Controllers\admin\TenantAdminController;
    use App\Http\Controllers\admin\PaketLanggananAdminController;
    use App\Http\Controllers\admin\LogAktivitasController;
    use App\Http\Controllers\admin\UserAdminController;

    Route::middleware('superAdmin')->group(function () {

        Route::apiResource('kebun', KebunController::class)->names('admin.kebun');
        Route::apiResource('blok', BlokController::class);
        Route::apiResource('node', NodeController::class);
        Route::apiResource('gateway', GatewayController::class);
        Route::apiResource('qr', KodeQrController::class);
        Route::get('langganan/transaksi/{id}/bukti-transfer', [LanggananAdminController::class, 'buktiTransfer']);
        Route::get('log-aktivitas', [LogAktivitasController::class, 'index']);


        Route::prefix('langganan/transaksi')->middleware('auth:sanctum')->group(function () {
            Route::get('/', [LanggananAdminController::class, 'index']);
            Route::patch('{id}/verifikasi', [LanggananAdminController::class, 'verifikasi'])->whereUuid('id');
            Route::patch('{id}/tolak', [LanggananAdminController::class, 'tolak'])->whereUuid('id');

        });
        Route::prefix('tenant')->group(function () {
            Route::get('/', [TenantAdminController::class, 'index']);
            Route::get('/{id}', [TenantAdminController::class, 'show']);
            Route::patch('/{id}/nonaktifkan', [TenantAdminController::class, 'nonaktifkan']);
            Route::patch('/{id}/aktifkan', [TenantAdminController::class, 'aktifkan']);
        });
        Route::prefix('paket-langganan')->group(function () {
            Route::get('/', [PaketLanggananAdminController::class, 'index']);
            Route::post('/', [PaketLanggananAdminController::class, 'store']);
            Route::get('/{id}', [PaketLanggananAdminController::class, 'show']);
            Route::put('/{id}', [PaketLanggananAdminController::class, 'update']);
            Route::patch('/{id}/nonaktifkan', [PaketLanggananAdminController::class, 'nonaktifkan']);
            Route::patch('/{id}/aktifkan', [PaketLanggananAdminController::class, 'aktifkan']);
            Route::delete('/{id}', [PaketLanggananAdminController::class, 'destroy']);
        });
        Route::prefix('user')->group(function () {
        Route::get('/', [UserAdminController::class, 'index']);
        Route::post('/', [UserAdminController::class, 'store']);
        Route::get('/{id}', [UserAdminController::class, 'show']);
        Route::patch('/{id}/nonaktifkan', [UserAdminController::class, 'nonaktifkan']);
        Route::patch('/{id}/aktifkan', [UserAdminController::class, 'aktifkan']);
    });
    });
