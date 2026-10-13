<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('akses_tenant_admins', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('admin_id');
            $table->enum('status', ['pending', 'disetujui', 'ditolak', 'dicabut'])->default('pending');
            $table->text('alasan')->nullable();
            $table->timestamp('diminta_pada');
            $table->timestamp('diputuskan_pada')->nullable();
            $table->uuid('diputuskan_oleh')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('tenant_id')->on('tenants')->cascadeOnDelete();
            $table->foreign('admin_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('diputuskan_oleh')->references('id')->on('users')->nullOnDelete();

            $table->index(['tenant_id', 'admin_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('akses_tenant_admins');
    }
};