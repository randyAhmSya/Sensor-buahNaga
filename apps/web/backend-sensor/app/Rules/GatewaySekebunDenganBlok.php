<?php

namespace App\Rules;

use App\Models\Blok;
use App\Models\Gateway;
use Closure;
use Illuminate\Contracts\Validation\DataAwareRule;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Gateway yang dipasang ke node harus berada di kebun yang sama dengan blok node.
 * Ini sekaligus menutup pemasangan node ke gateway milik tenant lain.
 *
 * Blok diambil dari $blokId (kalau diberikan, mis. saat update node) atau dari
 * field $kunciBlok pada input (saat tambah node).
 */
class GatewaySekebunDenganBlok implements ValidationRule, DataAwareRule
{
    protected array $data = [];

    public function __construct(
        private ?string $blokId = null,
        private string $kunciBlok = 'blok_id',
    ) {
    }

    public function setData(array $data): static
    {
        $this->data = $data;

        return $this;
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $blokId = $this->blokId ?? ($this->data[$this->kunciBlok] ?? null);

        // uuid dicek dulu supaya Postgres tidak menerima nilai sampah
        if (!is_string($blokId) || !\Illuminate\Support\Str::isUuid($blokId)
            || !is_string($value) || !\Illuminate\Support\Str::isUuid($value)) {
            return; // aturan uuid/exists yang melapor
        }

        $blok = Blok::find($blokId);
        $gateway = Gateway::with('blok')->find($value);

        if (!$blok || !$gateway) {
            return;
        }

        if ($gateway->blok?->kebun_id !== $blok->kebun_id) {
            $fail('Gateway harus berasal dari kebun yang sama dengan blok node.');
        }
    }
}
