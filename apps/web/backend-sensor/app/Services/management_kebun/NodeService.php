<?php

namespace App\Services\management_kebun;

use App\Models\nodeSensor;

class NodeService
{
    public function getAllNodesByKebun(string $kebunId)
    {
        return nodeSensor::with(['blok', 'gateway'])->whereHas('blok', function ($query) use ($kebunId) {
            $query->where('kebun_id', $kebunId);
        })->get();
    }

    public function getNodeById(string $id)
    {
        return nodeSensor::with(['blok', 'gateway', 'qr'])->find($id);
    }

    public function createNode(array $data)
    {
        return nodeSensor::create($data);
    }

    public function updateNode(nodeSensor $node, array $data)
    {
        $node->update($data);
        return $node;
    }

    public function deleteNode(nodeSensor $node)
    {
        $node->delete();
    }
}
