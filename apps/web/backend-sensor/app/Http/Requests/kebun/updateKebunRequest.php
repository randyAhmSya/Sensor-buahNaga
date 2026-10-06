<?php

namespace App\Http\Requests\kebun;

use App\Traits\FileUploadTrait;
use Illuminate\Foundation\Http\FormRequest;

class UpdateKebunRequest extends FormRequest
{
    use FileUploadTrait;
    public function authorize(): bool
    {
        return true;
    }
    public function rules(): array
    {
        return [
            'nama_kebun' => 'sometimes|required|string|max:100',
            'lokasi_kebun' => 'nullable|string|max:100',
            'foto' => $this->aturanValidasiFoto(false),
            'status_kebun' => 'sometimes|boolean',
        ];
    }
}
