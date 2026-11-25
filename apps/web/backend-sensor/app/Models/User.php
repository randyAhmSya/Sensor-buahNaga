<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Traits\GenerateUuid;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

// #[Fillable(['name', 'email', 'password'])]
// #[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use GenerateUuid, HasApiTokens, HasFactory, Notifiable;

    protected $primaryKey = 'id';

    protected $fillable = [
        'tenant_id',
        'nama_lengkap',
        'email',
        'password',
        'role',
        'is_aktif',
        'google_id',
        'nomor_telepon',
        'url_foto',
        'profil_lengkap',
        'email_verified_at',

    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_aktif' => 'boolean',
            'profil_lengkap' => 'boolean',
        ];
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'tenant_id');
    }
}
