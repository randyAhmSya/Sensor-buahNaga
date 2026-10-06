<?php

namespace App\Http\Requests\kebun;

use Illuminate\Foundation\Http\FormRequest;
use App\Traits\FileUploadTrait;
use Illuminate\Validation\Rule;

class AddKebunRequest extends FormRequest
{
    use FileUploadTrait;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $user = $this->user();

        return [
            // Jika superAdmin, tenant_id wajib ada di input JSON. Jika bukan, abaikan input tersebut.
            'tenant_id' => [
                $user && $user->role === 'superAdmin' ? 'required' : 'nullable',
                'uuid',
                'exists:tenants,tenant_id',
            ],
            'nama_kebun'   => 'required|string|max:100',
            'lokasi_kebun' => 'nullable|string|max:100',
            'foto'         => $this->aturanValidasiFoto(false),
            'status_kebun' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'tenant_id.required' => 'Super Admin wajib menyertakan tenant_id dari pemilik kebun.',
        ];
    }
}