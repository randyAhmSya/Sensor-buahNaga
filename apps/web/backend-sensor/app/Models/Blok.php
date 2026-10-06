<?php

namespace App\Models;

use App\Traits\GenerateUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Blok extends Model
{
    use HasFactory, GenerateUuid;
    protected $table = 'bloks';
    protected $primaryKey = 'id_blok';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'kebun_id',
        'nama_blok',
        'keterangan',
        'luas_area',
        'url_foto',
    ];

    // Blok adalah milik 1 Kebun
    public function kebun()
    {
        return $this->belongsTo(Kebun::class, 'kebun_id', 'id_kebun');
    }
    public function nodeSensor()
    {
        return $this->hasOne(NodeSensor::class, 'blok_id', 'id_blok');
    }
}
