<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\GenerateUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SiklusPanen extends Model
{
     use HasFactory, GenerateUuid;
 
    protected $table = 'siklus_panens';
    protected $primaryKey = 'id_siklus_panen';
    public $incrementing = false;
    protected $keyType = 'string';
 
    protected $fillable = [
        'block_id',
        'tanggal_penyinaran',
        'target_hari_berbunga',
        'tanggal_berbunga_aktual',
        'target_hari_panen_setelah_bunga',
        'estimasi_tanggal_panen',
        'tanggal_panen',
        'status_siklus',
    ];
 
    protected $casts = [
        'tanggal_penyinaran'      => 'datetime',
        'tanggal_berbunga_aktual' => 'datetime',
        'estimasi_tanggal_panen'  => 'datetime',
        'tanggal_panen'           => 'datetime',
    ];
 
    public function blok()
    {
        return $this->belongsTo(Blok::class, 'block_id', 'id_blok');
    }
}
