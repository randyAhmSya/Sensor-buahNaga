<?php

namespace App\Http\Requests\node;

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
        $sensorId = $this->route('node');
        return [
            'gateway_id' => 'sometimes|uuid|exists:gateways,id_gateway',
            'kode_perangkat' => ['sometimes', 'string', Rule::unique('node_sensors', 'kode_perangkat')->ignore($sensorId, 'id_sensor')],
            'tipe_sensor' => 'sometimes|string',
            'status_koneksi' => 'sometimes|string',
        ];
    }
}
