<?php

namespace App\Services\management_kebun;

use App\Models\Blok;
use App\Models\Gateway;
use App\Models\Kebun;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class GatewayService
{
    public function getAllGatewaysByKebun(string $kebunId)
    {
        return Gateway::with('blok')->whereHas('blok', function ($query) use ($kebunId) {
            $query->where('kebun_id', $kebunId);
        })->get();
    }

    public function getGatewayById(string $id)
    {
        return Gateway::with('blok')->find($id);
    }

    /**
     * Satu kebun hanya boleh punya satu gateway.
     *
     * @throws \DomainException bila kebun sudah punya gateway
     */
    public function createGateway(array $data)
    {
        return DB::transaction(function () use ($data) {
            $blok = Blok::findOrFail($data['blok_id']);

            Kebun::whereKey($blok->kebun_id)->lockForUpdate()->first();

            $sudahAda = Gateway::whereHas('blok', fn ($q) => $q->where('kebun_id', $blok->kebun_id))->exists();
            if ($sudahAda) {
                throw new \DomainException('Kebun ini sudah memiliki gateway. Satu kebun hanya boleh punya satu gateway.');
            }

            $data['status_koneksi'] = 'belum_terhubung';
            $data['kode_pairing'] = 'PAIR-' . strtoupper(Str::random(6));

            return Gateway::create($data);
        });
    }

    public function updateGateway(Gateway $gateway, array $data)
    {
        $gateway->update($data);
        return $gateway;
    }

    public function deleteGateway(Gateway $gateway)
    {
        $gateway->delete();
    }
}
