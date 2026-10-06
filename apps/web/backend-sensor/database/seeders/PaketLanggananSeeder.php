<?php

namespace Database\Seeders;

use App\Models\PaketLangganan;
use Illuminate\Database\Seeder;

class PaketLanggananSeeder extends Seeder
{
    public function run(): void
    {
        $paket = [
            ['nama_paket' => 'Paket 7 Hari',  'tambahan_hari' => 7,  'harga' => 50000],
            ['nama_paket' => 'Paket 30 Hari', 'tambahan_hari' => 30, 'harga' => 180000],
            ['nama_paket' => 'Paket 90 Hari', 'tambahan_hari' => 90, 'harga' => 480000],
        ];

        foreach ($paket as $p) {
            PaketLangganan::updateOrCreate(
                ['nama_paket' => $p['nama_paket']],
                $p + ['status_aktif' => true]
            );
        }
    }
}