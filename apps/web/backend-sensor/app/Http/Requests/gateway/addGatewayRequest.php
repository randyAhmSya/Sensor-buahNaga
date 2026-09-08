<?php

namespace App\Http\Requests\gateway;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class addGatewayRequest extends FormRequest
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
            'blok_id' => 'required|uuid|exists:bloks,id_blok',
            'kode_perangkat' => 'required|string|unique:gateways,kode_perangkat',
            'status_koneksi' => 'required|string',
        ];
    }
}
