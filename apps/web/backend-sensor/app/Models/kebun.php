<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\GenerateUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class kebun extends Model
{
    use HasFactory, GenerateUuid;
    protected $table = 'kebuns';
    protected $primaryKey = 'id_kebun';
    public $incrementing = false;
    protected $keyType = 'string';

   protected $fillable = [
        'tenant_id',
        'nama_kebun',
        'lokasi_kebun',
        'url_foto',
        'status_kebun',
    ];

    protected $casts = [
        'status_kebun' => 'boolean',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'tenant_id');
    }

    public function bloks(): HasMany
    {
        return $this->hasMany(blok::class, 'kebun_id', 'id_kebun');
    }
}
