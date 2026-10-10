<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
    ],

    // Izinkan method standar REST API saja
    'allowed_methods' => [
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'OPTIONS',
    ],

    // Ambil daftar origin dari .env dan parse menjadi array secara dinamis
    'allowed_origins' => array_filter(
        explode(',', env('FRONTEND_URL', 'http://localhost:3000'))
    ),

    'allowed_origins_patterns' => [],

    // Batasi headers yang diizinkan untuk mencegah injection header sembarangan
    'allowed_headers' => [
        'Content-Type',
        'X-Requested-With',
        'Authorization',
        'Accept',
        'Origin',
    ],

    'exposed_headers' => [],

    // Cache pre-flight response (OPTIONS) selama 1 jam untuk efisiensi network
    'max_age' => 3600,

    // Wajib bernilai true jika menggunakan autentikasi session/cookies (Sanctum)
    'supports_credentials' => true,

];
