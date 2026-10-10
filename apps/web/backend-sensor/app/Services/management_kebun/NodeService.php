<?php

namespace App\Services\management_kebun;

use App\Models\NodeSensor;
use App\Models\KodeQr;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class NodeService
{
    public function getAllNodesByKebun(string $kebunId)
    {
        return NodeSensor::with(['blok', 'gateway'])->whereHas('blok', function ($query) use ($kebunId) {
            $query->where('kebun_id', $kebunId);
        })->get();
    }

    public function getNodeById(string $id)
    {
        if (\Illuminate\Support\Str::isUuid($id)) {
            return NodeSensor::with(['blok.kebun', 'gateway', 'qr'])->find($id);
        }

        return NodeSensor::with(['blok.kebun', 'gateway', 'qr'])
            ->where(function ($query) use ($id) {
                $query->whereHas('qr', function ($q) use ($id) {
                    $q->where('teks_kode_qr', $id);
                })
                ->orWhere('kode_perangkat', $id);
            })
            ->first();
    }

    public function createNode(array $data)
    {
        return DB::transaction(function () use ($data) {

            if (empty($data['qr_id'])) {
                $qrBaru = KodeQr::create([
                    'teks_kode_qr' => 'QR-NODE-' . strtoupper(Str::random(6)),
                    'status_qr'    => true
                ]);

                $data['qr_id'] = $qrBaru->id_qr;
            }

            return NodeSensor::create($data);
        });
    }

    public function updateNode(NodeSensor $node, array $data)
    {
        $node->update($data);
        return $node;
    }

    public function deleteNode(NodeSensor $node)
    {
        $node->delete();
    }

    public function generateNewQrForSensor($id_sensor)
    {
        return DB::transaction(function () use ($id_sensor) {
            $sensor = NodeSensor::findOrFail($id_sensor);

            if ($sensor->qr_id) {
                KodeQr::where('id_qr', $sensor->qr_id)->delete();
            }

            $qrBaru = KodeQr::create([
                'teks_kode_qr' => 'QR-NODE-' . strtoupper(Str::random(6)),
                'status_qr'    => true
            ]);

            $sensor->update(['qr_id' => $qrBaru->id_qr]);

            return $sensor->load('qr');
        });
    }
}
