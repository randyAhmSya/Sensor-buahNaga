<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\GenerateUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class kode_qr extends Model
{
    use HasFactory, GenerateUuid;
    protected $table = 'kode_qrs';
    protected $primaryKey = 'id_qr';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'teks_kode_qr',
        'status_qr',
    ];

    protected $casts = [
        'status_qr' => 'boolean',
    ];

    public function nodeSensor()
    {
        return $this->hasMany(NodeSensor::class, 'qr_id', 'id_qr');
    }
}
