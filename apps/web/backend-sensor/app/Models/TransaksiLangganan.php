<?php

namespace App\Models;

use App\Traits\GenerateUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class TransaksiLangganan extends Model
{
    use GenerateUuid;

    protected $table = 'transaksi_langganans';
    protected $primaryKey = 'id_transaksi';

    protected $fillable = [
        'tenant_id', 'paket_langganan_id', 'nama_paket', 'tambahan_hari', 'harga',
        'metode_pembayaran', 'status_pembayaran','alasan_penolakan', 'bukti_transfer',
        'referensi_gateway', 'diverifikasi_oleh', 'diverifikasi_pada',
    ];

    public function getBuktiTransferUrlAttribute(): ?string
    {
        return $this->bukti_transfer
            ? Storage::disk('public')->url($this->bukti_transfer)
            : null;
    }

    public function paket()
    {
        return $this->belongsTo(PaketLangganan::class, 'paket_langganan_id', 'id_paket');
    }
    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'tenant_id');
    }
}
