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
        Schema::create('kebuns', function (Blueprint $table) {
            $table->uuid('id_kebun')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants', 'tenant_id')->cascadeOnDelete();
            $table->string('nama_kebun');
            $table->string('lokasi_kebun')->nullable();
            $table->string('url_foto')->nullable();
            $table->boolean('status_kebun')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kebuns');
    }
};
