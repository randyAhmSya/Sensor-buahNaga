<?php
return [

    'timezone' => env('LAMPU_TIMEZONE', 'Asia/Jakarta'),
    'offline_setelah_detik' => (int) env('LAMPU_OFFLINE_SETELAH_DETIK', 20),
    'retensi_telemetri_hari'  => (int) env('LAMPU_RETENSI_TELEMETRI_HARI', 30),
    'retensi_energi_hari'     => (int) env('LAMPU_RETENSI_ENERGI_HARI', 30),
    'retensi_peredupan_hari'  => (int) env('LAMPU_RETENSI_PEREDUPAN_HARI', 365),
    'retensi_ukuran_kelompok' => (int) env('LAMPU_RETENSI_KELOMPOK', 10000),
    'zona_ringkasan'          => env('LAMPU_ZONA_RINGKASAN', 'Asia/Jakarta'),
];