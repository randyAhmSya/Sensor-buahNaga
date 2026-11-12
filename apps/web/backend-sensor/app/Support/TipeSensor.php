<?php

namespace App\Support;

/**
 * Daftar tipe sensor node yang didukung. Satu-satunya sumber kebenaran di backend.
 *
 * Auto-dimming hanya memakai nilai lux, jadi node wajib punya sensor cahaya.
 * Sensor suhu bersifat pelengkap (hanya ditampilkan di dashboard).
 */
final class TipeSensor
{
    public const LUX_SUHU = 'lux_suhu';
    public const CAHAYA = 'cahaya';

    public const DAFTAR = [self::LUX_SUHU, self::CAHAYA];
}
