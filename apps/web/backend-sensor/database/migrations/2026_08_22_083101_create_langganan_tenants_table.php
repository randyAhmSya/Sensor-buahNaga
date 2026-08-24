<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('langganan_tenants', function (Blueprint $table) {
            $table->uuid('id_langganan')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants', 'tenant_id')->cascadeOnDelete();
            $table->string('status_langganan');
            $table->integer('sisa_hari');
            $table->timestamp('tanggal_aktif_terakhir')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('langganan_tenants');
    }
};
