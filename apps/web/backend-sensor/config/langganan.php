<?php

return [
    'wajib' => env('LANGGANAN_WAJIB', true),
    
    'trial_hari' => (int) env('LANGGANAN_TRIAL_HARI', 7),

    'masa_tenggang_hari' => (int) env('LANGGANAN_MASA_TENGGANG_HARI', 2),
];