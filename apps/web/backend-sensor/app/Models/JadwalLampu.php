<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\GenerateUuid;

class JadwalLampu extends Model
{
    use HasFactory, GenerateUuid;
 
    protected $table = 'jadwal_lampus';
    protected $primaryKey = 'id_jadwal_lampu';
    public $incrementing = false;
    protected $keyType = 'string';
 
    protected $fillable = [
        'kebun_id',
        'sensor_id',
        'jam_mulai_nyala',
        'jam_akhir_nyala',
        'mode',
        'instensitas_cahaya',
        'target_lux',
        'intensitas_minimum',
        'status_aktif',
        'keterangan',
    ];
 
    protected $casts = [
        'status_aktif' => 'boolean',
    ];
 
    public function kebun()
    {
        return $this->belongsTo(Kebun::class, 'kebun_id', 'id_kebun');
    }
 
    public function sensor()
    {
        return $this->belongsTo(NodeSensor::class, 'sensor_id', 'id_sensor');
    }
}
