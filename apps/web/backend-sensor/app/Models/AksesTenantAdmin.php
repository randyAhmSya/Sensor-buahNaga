<?php

namespace App\Models;

use App\Traits\GenerateUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AksesTenantAdmin extends Model
{
    use GenerateUuid;

    protected $table = 'akses_tenant_admins';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
    'tenant_id',
    'admin_id',
    'status',
    'alasan_permintaan',
    'alasan_penolakan',
    'diminta_pada',
    'diputuskan_pada',
    'diputuskan_oleh',
    ];

    protected $casts = [
        'diminta_pada' => 'datetime',
        'diputuskan_pada' => 'datetime',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'tenant_id');
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id', 'id');
    }

    public function penentu(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diputuskan_oleh', 'id');
    }
}
