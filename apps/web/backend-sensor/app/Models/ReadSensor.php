<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\GenerateUuid;

class ReadSensor extends Model
{
    use HasFactory, GenerateUuid;
 
    protected $table = 'read__sensors';
    protected $primaryKey = 'id_read_sensor';
    public $incrementing = false;
    protected $keyType = 'string';
 
    protected $fillable = [
        'sensor_id',
        'nilai_lux',
        'suhu',
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
