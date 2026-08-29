<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $this->call([
            TenantSeeder::class,
            UserSeeder::class,
            TransaksiLanggananSeeder::class,
            LanggananTenantSeeder::class,
            KebunSeeder::class,
            BlokSeeder::class,
            SiklusPanenSeeder::class,
            KodeQrSeeder::class,
            GatewaySeeder::class,
            NodeSensorSeeder::class,
            ReadSensorSeeder::class,
            JadwalLampuSeeder::class,
            LogPeredupanSeeder::class,
            LogEnergySeeder::class,
        ]);
    }
}
