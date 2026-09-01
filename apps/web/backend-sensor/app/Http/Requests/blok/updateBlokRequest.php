<?php

namespace App\Http\Requests\blok;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class updateBlokRequest extends FormRequest
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
            'nama_blok'  => 'sometimes|string|max:100',
            'keterangan' => 'nullable|string',
            'luas_area'  => 'nullable|numeric',
            'url_foto'   => 'nullable|string',
        ];
    }
}
