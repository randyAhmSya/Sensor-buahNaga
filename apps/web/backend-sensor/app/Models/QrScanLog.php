<?php

namespace App\Models;
use App\Traits\GenerateUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;

use Illuminate\Database\Eloquent\Model;

class QrScanLog extends Model
{
     use HasFactory, GenerateUuid;
    protected $table = 'qr_scan_logs';
    protected $primaryKey = 'id_scan_log';
    public $incrementing = false;
    protected $keyType = 'string';
 
    protected $fillable = [
        'qr_id',
        'user_id',
        'nama_user_saat_scan',
        'status_scan',
        'platform',
        'ip_address',
        'latitude',
        'longitude',
        'dicatat_pada',
    ];
 
    protected $casts = [
        'dicatat_pada' => 'datetime',
        'latitude'     => 'decimal:7',
        'longitude'    => 'decimal:7',
    ];
 
    public function kodeQr()
    {
        return $this->belongsTo(KodeQr::class, 'qr_id', 'id_qr');
    }
 
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
