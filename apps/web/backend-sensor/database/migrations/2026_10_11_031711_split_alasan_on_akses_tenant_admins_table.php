<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('akses_tenant_admins', function (Blueprint $table) {
            $table->text('alasan_permintaan')->nullable()->after('status');
            $table->text('alasan_penolakan')->nullable()->after('alasan_permintaan');
        });

        // pindahin data lama (kalau ada) dari kolom `alasan` ke `alasan_permintaan`
        DB::table('akses_tenant_admins')->whereNotNull('alasan')->update([
            'alasan_permintaan' => DB::raw('alasan'),
        ]);

        Schema::table('akses_tenant_admins', function (Blueprint $table) {
            $table->dropColumn('alasan');
        });
    }

    public function down(): void
    {
        Schema::table('akses_tenant_admins', function (Blueprint $table) {
            $table->text('alasan')->nullable();
        });

        DB::table('akses_tenant_admins')->whereNotNull('alasan_permintaan')->update([
            'alasan' => DB::raw('alasan_permintaan'),
        ]);

        Schema::table('akses_tenant_admins', function (Blueprint $table) {
            $table->dropColumn(['alasan_permintaan', 'alasan_penolakan']);
        });
    }
};