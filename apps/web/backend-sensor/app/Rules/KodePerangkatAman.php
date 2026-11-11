<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Satu-satunya definisi format kode perangkat/kode pairing.
 * Kode gateway ditulis ke file ACL Mosquitto, jadi tidak boleh memuat
 * baris baru, '#', '+', '/', atau spasi.
 */
class KodePerangkatAman implements ValidationRule
{
    // \z (bukan $) supaya baris baru di ujung tidak lolos
    public const POLA = '/^[A-Za-z0-9_-]{3,50}\z/';

    public const PESAN = 'Kode hanya boleh huruf, angka, strip, dan garis bawah (3 sampai 50 karakter).';

    /** Dipakai juga di luar validator, mis. di GatewayPairingService. */
    public static function valid(mixed $kode): bool
    {
        return is_string($kode) && preg_match(self::POLA, $kode) === 1;
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!self::valid($value)) {
            $fail(self::PESAN);
        }
    }
}
