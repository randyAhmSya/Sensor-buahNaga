<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\GenerateUuid;

class LogPeredupan extends Model
{
     use HasFactory, GenerateUuid;
 
    protected $table = 'log_peredupans';
    protected $primaryKey = 'id_log_peredupan';
    public $incrementing = false;
    protected $keyType = 'string';
 
    protected $fillable = [
        'sensor_id',
        'presentase_redup',
        'nilai_lux',
        'fase_bulan',
        'dicatat_pada',
    ];
 
    protected $casts = [
        'dicatat_pada' => 'datetime',
    ];
 
    public function sensor()
    {
        return $this->belongsTo(NodeSensor::class, 'sensor_id', 'id_sensor');
    }
}
