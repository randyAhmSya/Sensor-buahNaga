<?php

namespace App\Http\Requests\kebun;

use Illuminate\Foundation\Http\FormRequest;
use App\Traits\FileUploadTrait;

class addkebunRequest extends FormRequest
{
    use fileUploadTrait;
    public function authorize(): bool
    {
        return true;
    }
    public function rules(): array
    {
        return [
            'tenant_id' => 'required|exists:tenants,tenant_id|uuid|sometimes',
            'nama_kebun' => 'required|string|max:100',
            'lokasi_kebun' => 'nullable|string|max:100',
            'foto' => $this->aturanValidasiFoto(false),
            'status_kebun' => 'nullable|boolean',
        ];
    }
}
