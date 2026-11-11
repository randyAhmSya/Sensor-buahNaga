<?php

namespace App\Http\Requests\node;

use App\Rules\GatewaySekebunDenganBlok;
use App\Rules\KodePerangkatAman;
use App\Services\management_kebun\NodeService;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class updateNodeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Route bisa berisi UUID, teks QR, atau kode perangkat. Samakan dengan controller.
        $node = app(NodeService::class)->getNodeById((string) $this->route('node'));

        return [
            'gateway_id' => ['bail', 'sometimes', 'uuid', 'exists:gateways,id_gateway', new GatewaySekebunDenganBlok($node?->blok_id)],
            'kode_perangkat' => ['sometimes', 'string', new KodePerangkatAman, Rule::unique('node_sensors', 'kode_perangkat')->ignore($node?->id_sensor, 'id_sensor')],
            'tipe_sensor' => 'sometimes|string',
            'status_koneksi' => 'sometimes|string',
        ];
    }
}
