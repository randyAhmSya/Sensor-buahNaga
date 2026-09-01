<?php

namespace App\Services\management_kebun;

use App\Models\kode_qr;
use Illuminate\Support\Str;

class KodeQrService
{
    public function getAllQr()
    {
        return kode_qr::all();
    }

    public function getQrById(string $id)
    {
        return kode_qr::find($id);
    }

    public function createQr(array $data)
    {

        if (empty($data['teks_kode_qr'])) {
            $data['teks_kode_qr'] = 'QR-NODE-' . strtoupper(Str::random(6));
        }

        if (!isset($data['status_qr'])) {
            $data['status_qr'] = true;
        }

        return kode_qr::create($data);
    }

    public function updateQr(kode_qr $qr, array $data)
    {
        $qr->update($data);
        return $qr;
    }

    public function deleteQr(kode_qr $qr)
    {
        $qr->delete();
    }
}
