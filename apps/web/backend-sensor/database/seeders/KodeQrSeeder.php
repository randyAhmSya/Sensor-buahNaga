<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class KodeQrSeeder extends Seeder {
    public function run(): void {
        for ($i = 1; $i <= 10; $i++) {
            DB::table('kode_qrs')->insert([
                'id_qr' => Str::uuid(),
                'teks_kode_qr' => 'AGRO-QR-' . strtoupper(Str::random(6)),
                'status_qr' => true,
                'created_at' => now(), 'updated_at' => now()
            ]);
        }
    }
}