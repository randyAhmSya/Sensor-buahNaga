<?php

namespace App\Models;

use App\Traits\GenerateUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class nodeSensor extends Model
{
    use HasFactory, GenerateUuid;

    protected $table = 'node_sensors';
    protected $primaryKey = 'id_sensor';
    public $incrementing = false;
    protected $keyType = 'string';



    protected $fillable = [
        'blok_id',
        'gateway_id',
        'qr_id',
        'kode_perangkat',
        'kode_pairing',
        'token_perangkat',
        'tipe_sensor',
        'status_koneksi',
        'terakhir_terlihat',
    ];

    public function gateway()
    {
        // Ubah menjadi 'gateway' (huruf kecil) menyesuaikan nama class di gateway.php
        return $this->belongsTo(gateway::class, 'gateway_id', 'id_gateway');
    }

    public function qr()
    {
        // Ubah menjadi 'kode_qr' menyesuaikan nama class di kode_qr.php
        return $this->belongsTo(kode_qr::class, 'qr_id', 'id_qr');
    }
    public function blok()
    {
        return $this->belongsTo(Blok::class, 'blok_id', 'id_blok');
    }
}
