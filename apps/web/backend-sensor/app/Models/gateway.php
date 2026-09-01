<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\GenerateUuid;

class gateway extends Model
{
    use HasFactory, GenerateUuid;

    protected $table = 'gateways';
    protected $primaryKey = 'id_gateway';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'blok_id',
        'kode_perangkat',
        'status_koneksi',
        'terakhir_terlihat',
        // 'token_gateway',
    ];

    protected $casts = [
        'terakhir_terlihat' => 'datetime',
    ];

    public function blok()
    {
        return $this->belongsTo(blok::class, 'blok_id', 'id_blok');
    }

    public function nodeSensors()
    {
        return $this->hasMany(NodeSensor::class, 'gateway_id', 'id_gateway');
    }
}
