<?php

namespace App\Http\Requests\paketLangganan;

use Illuminate\Foundation\Http\FormRequest;

class StorePaketLanggananRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // udah dijaga middleware superAdmin di route
    }

    public function rules(): array
    {
        return [
            'nama_paket' => 'required|string|max:100',
            'tambahan_hari' => 'required|integer|min:1',
            'harga' => 'required|numeric|min:0',
            'status_aktif' => 'sometimes|boolean',
        ];
    }
}
