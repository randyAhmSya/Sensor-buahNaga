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
        Schema::create('bloks', function (Blueprint $table) {
            $table->uuid('id_blok')->primary();
            $table->foreignUuid('kebun_id')->constrained('kebuns', 'id_kebun')->cascadeOnDelete();
            $table->string('nama_kebun');
            $table->string('keterangan')->nullable();
            $table->float('luas_area')->nullable();
            $table->string('url_foto')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bloks');
    }
};
