<?php

namespace App\Services\management_kebun;

use App\Models\blok;

class BlokService
{
    public function getAllBlokByKebun(string $kebunId)
    {
        return blok::with('kebun')->where('kebun_id', $kebunId)->get();
    }

    public function getBlokById(string $id)
    {
        return blok::with('kebun')->find($id);
    }

    public function createBlok(array $data)
    {
        return blok::create($data);
    }

    public function updateBlok(blok $blok, array $data)
    {
        $blok->update($data);
        return $blok;
    }

    public function deleteBlok(blok $blok)
    {
        $blok->delete();
    }
}
