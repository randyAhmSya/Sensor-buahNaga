<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BlokSeeder extends Seeder
{
    public function run(): void
    {
        $kebuns = DB::table('kebuns')->get();
        foreach ($kebuns as $k) {
            for ($i = 1; $i <= 2; $i++) {
                DB::table('bloks')->insert([
                    'id_blok' => Str::uuid(),
                    'kebun_id' => $k->id_kebun,
                    'nama_blok' => 'Blok ' . $i . ' ' . $k->nama_kebun,
                    'keterangan' => 'Blok ' . $i . ' Lampu LED',
                    'luas_area' => 1000.50,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }
    }
}

