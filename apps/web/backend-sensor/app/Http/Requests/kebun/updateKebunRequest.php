<?php

namespace App\Http\Requests\kebun;

use Illuminate\Foundation\Http\FormRequest;

class updatekebunRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }
    public function rules(): array
    {
        return [
            'nama_kebun' => 'sometimes|required|string|max:100',
            'lokasi_kebun' => 'nullable|string|max:100',
            'url_foto' => 'nullable|string|max:100',
            'status_kebun' => 'sometimes|boolean',
        ];
    }
}
