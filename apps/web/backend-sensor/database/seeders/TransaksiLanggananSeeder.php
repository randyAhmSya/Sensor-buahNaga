<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TransaksiLanggananSeeder extends Seeder {
    public function run(): void {
        $tenants = DB::table('tenants')->get();
        foreach ($tenants as $t) {
            DB::table('transaksi_langganans')->insert([
                'id_transaksi' => Str::uuid(),
                'tenant_id' => $t->tenant_id,
                'nama_paket' => 'Paket ' . ucfirst($t->paket_langganan),
                'tambahan_hari' => 30,
                'harga' => 250000.00,
                'status_pembayaran' => 'SUCCESS',
                'created_at' => now(), 'updated_at' => now()
            ]); 
        }
    }
}