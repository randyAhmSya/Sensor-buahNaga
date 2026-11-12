<?php

namespace App\Http\Requests\node;

use App\Rules\GatewaySekebunDenganBlok;
use App\Rules\KodePerangkatAman;
use App\Support\TipeSensor;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'gateway_id' => ['bail', 'required', 'uuid', 'exists:gateways,id_gateway', new GatewaySekebunDenganBlok],
            'qr_id' => 'nullable|uuid|exists:kode_qrs,id_qr',
            'kode_perangkat' => ['required', 'string', new KodePerangkatAman, 'unique:node_sensors,kode_perangkat'],
            'jumlah_lampu' => 'sometimes|integer|min:1|max:10000',
            'watt_per_lampu' => 'nullable|numeric|min:0|max:5000',
            'tipe_sensor' => ['required', 'string', Rule::in(TipeSensor::DAFTAR)],
            'status_koneksi' => 'required|string',
        ];
    }
}
