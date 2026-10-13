<?php

namespace App\Services\management_kebun;

use App\Models\Blok;
use App\Traits\FileUploadTrait;

class BlokService
{
    use FileUploadTrait;

    public function getAllBlokByKebun(string $kebunId)
    {
        return Blok::with('kebun')->where('kebun_id', $kebunId)->get();
    }

    public function getBlokById(string $id)
    {
        return Blok::with('kebun')->find($id);
    }

    public function createBlok(array $data, $fileFoto = null)
    {
        if ($fileFoto) {
            $data['url_foto'] = $this->uploadFoto($fileFoto, 'foto_blok');
        }

        return Blok::create($data);
    }

    public function updateBlok(blok $blok, array $data, $fileFoto = null)
    {
        if ($fileFoto) {
            // Dulu foto lama nggak pernah kehapus di sini karena $oldPath
            // nggak dikirim ke uploadFoto() -- beda dari KebunService yang
            // udah bener. Sekarang disamain biar foto lama ikut dibersihkan
            // tiap kali ada foto baru di-upload.
            $data['url_foto'] = $this->uploadFoto($fileFoto, 'foto_blok', $blok->url_foto);
        }

        $blok->update($data);
        return $blok;
    }

    public function deleteBlok(blok $blok)
    {
        $this->hapusFoto($blok->url_foto);
        $blok->delete();
    }
}