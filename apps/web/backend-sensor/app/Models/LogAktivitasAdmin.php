<?php

namespace App\Models;

use App\Traits\GenerateUuid;
use Illuminate\Database\Eloquent\Model;

class LogAktivitasAdmin extends Model
{
    use GenerateUuid;

    protected $table = 'log_aktivitas_admins';
    protected $primaryKey = 'id_log';

    protected $fillable = ['admin_id', 'aksi', 'target_tipe', 'target_id', 'keterangan'];

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id', 'id');
    }
}