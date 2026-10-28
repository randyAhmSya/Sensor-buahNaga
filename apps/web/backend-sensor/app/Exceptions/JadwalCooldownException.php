<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Dilempar saat slider intensitas manual diubah lagi sebelum cooldown selesai.
 * Controller memetakannya ke HTTP 429 + header Retry-After.
 */
class JadwalCooldownException extends RuntimeException
{
    public function __construct(string $message, protected int $sisaDetik = 0)
    {
        parent::__construct($message);
    }

    public function sisaDetik(): int
    {
        return $this->sisaDetik;
    }
}