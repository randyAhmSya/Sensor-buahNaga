<?php

namespace App\Models;

use App\Traits\GenerateUuid;
use Illuminate\Database\Eloquent\Model;

class LanggananTenant extends Model
{
    use GenerateUuid;

    protected $table = 'langganan_tenants';
    protected $primaryKey = 'id_langganan';

    protected $fillable = ['tenant_id', 'status_langganan', 'sisa_hari', 'tanggal_aktif_terakhir'];

    protected $casts = ['tanggal_aktif_terakhir' => 'datetime'];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'tenant_id');
    }


    public function sisaHariMentah(): int
    {
        if (!$this->tanggal_aktif_terakhir) {
            return 0;
        }

        $hariTerpakai = max(0, (int) $this->tanggal_aktif_terakhir->diffInDays(now()));
        return $this->sisa_hari - $hariTerpakai;
    }

    public function sisaHariAktual(): int
    {
        return max(0, $this->sisaHariMentah());
    }

    public function isAktif(): bool
    {
        return $this->sisaHariAktual() > 0;
    }

    public function dalamMasaTenggang(): bool
    {
        $mentah = $this->sisaHariMentah();
        $batas = (int) config('langganan.masa_tenggang_hari', 0);

        return $mentah <= 0 && $mentah > -$batas;
    }

 
    public function statusEfektif(): string
    {
        if ($this->isAktif()) {
            return 'aktif';
        }

        if ($this->dalamMasaTenggang()) {
            return 'tenggang';
        }

        return 'kadaluarsa';
    }
}