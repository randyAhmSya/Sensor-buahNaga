<?php

use App\Http\Controllers\petani\KebunController;
use Illuminate\Support\Facades\Route;

Route::middleware('superAdmin')->group(function () {

    Route::apiResource('kebun', KebunController::class)->names('admin.kebun');
});
