<?php

namespace App\Http\Requests\node;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class addNodeRequest extends FormRequest
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
        return [
            'blok_id' => 'required|uuid|exists:bloks,id_blok|unique:node_sensors,blok_id',
            'gateway_id' => 'required|uuid|exists:gateways,id_gateway',
            'qr_id' => 'nulllable|uuid|exists:kode_qrs,id_qr',
            'kode_perangkat' => 'required|string|unique:node_sensors,kode_perangkat',
            'kode_pairing' => 'nullable|string|unique:node_sensors,kode_pairing',
            'token_perangkat' => 'nullable|string|unique:node_sensors,token_perangkat',
            'tipe_sensor' => 'required|string',
            'status_koneksi' => 'required|string',
        ];
    }
}
