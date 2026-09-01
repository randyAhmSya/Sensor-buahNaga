<?php

namespace App\Models;

use App\Traits\GenerateUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends Model
{

    use GenerateUuid, HasFactory;

    protected $table = 'tenants';
    protected $primaryKey = 'tenant_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'nama_tenant',
        'paket_langganan',
        'is_admin_allowed',
    ];

    protected $casts = [
        'is_admin_allowed' => 'boolean',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'tenant_id', 'tenant_id');
    }


    public function kebuns(): HasMany
    {
        return $this->hasMany(kebun::class, 'tenant_id', 'tenant_id');
    }
    public function tenant()
    {
        // Kebun dimiliki oleh 1 Tenant
        return $this->belongsTo(Tenant::class, 'tenant_id', 'tenant_id');
    }
}
