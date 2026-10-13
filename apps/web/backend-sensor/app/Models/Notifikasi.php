<?php

namespace App\Models;

use App\Traits\GenerateUuid;
use Illuminate\Database\Eloquent\Model;

class Notifikasi extends Model
{
    use GenerateUuid;

    protected $table = 'notifikasis';
    protected $primaryKey = 'id_notifikasi';

    protected $fillable = ['tenant_id', 'tipe', 'judul', 'pesan', 'data', 'sudah_dibaca', 'dibaca_pada'];

    protected $casts = [
        'data' => 'array',
        'sudah_dibaca' => 'boolean',
        'dibaca_pada' => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'tenant_id');
    }
}
