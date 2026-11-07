<?php
 
return [
    // Nyalakan lewat .env: PROFIL_REQUEST=true  (matikan lagi setelah selesai mengukur)
    'aktif' => env('PROFIL_REQUEST', false),
 
    // Query yang lebih lambat dari ini (ms) dicatat lengkap dengan SQL-nya
    'query_lambat_ms' => env('PROFIL_QUERY_LAMBAT_MS', 100),
];
 