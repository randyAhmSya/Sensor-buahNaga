<?php

namespace App\Services\management_kebun;

use App\Models\Gateway;

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

    public function createGateway(array $data)
    {
        return Gateway::create($data);
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
