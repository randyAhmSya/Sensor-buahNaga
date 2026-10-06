<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\GenerateUuid;

class LogEnergy extends Model
{
    use HasFactory, GenerateUuid;
 
    protected $table = 'log_energies';
    protected $primaryKey = 'id_log';
    public $incrementing = false;
    protected $keyType = 'string';
 
    protected $fillable = [
        'sensor_id',
        'konsumsi_watt',
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
