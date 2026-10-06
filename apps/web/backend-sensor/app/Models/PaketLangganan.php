<?php

namespace App\Models;

use App\Traits\GenerateUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaketLangganan extends Model
{
    use HasFactory, GenerateUuid;

    protected $table = 'paket_langganans';
    protected $primaryKey = 'id_paket';

    protected $fillable = ['nama_paket', 'tambahan_hari', 'harga', 'status_aktif'];
}