<?php

namespace App\Services\management_kebun;

use App\Models\KodeQr;
use Illuminate\Support\Str;

class KodeQrService
{
    public function getAllQr()
    {
        return KodeQr::all();
    }

    public function getQrById(string $id)
    {
        return KodeQr::find($id);
    }

    public function createQr(array $data)
    {

        if (empty($data['teks_kode_qr'])) {
            $data['teks_kode_qr'] = 'QR-NODE-' . strtoupper(Str::random(6));
        }

        if (!isset($data['status_qr'])) {
            $data['status_qr'] = true;
        }

        return KodeQr::create($data);
    }

    public function updateQr(KodeQr $qr, array $data)
    {
        $qr->update($data);
        return $qr;
    }

    public function deleteQr(KodeQr $qr)
    {
        $qr->delete();
    }
}
