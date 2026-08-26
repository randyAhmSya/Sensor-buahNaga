<?php

namespace App\Models;

use App\Traits\GenerateUuid;
use Illuminate\Database\Eloquent\Model;

class Tenant extends Model
{

    use GenerateUuid;

    protected $primaryKey = 'tenant_id';

    protected $fillable = [
        'nama_tenant',
        'paket_langganan'
    ];
}
