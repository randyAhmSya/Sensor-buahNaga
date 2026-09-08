<?php

namespace App\Http\Requests\blok;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use App\Traits\FileUploadTrait;

class addBlokRequest extends FormRequest
{
    use FileUploadTrait;
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
            'kebun_id' => 'required|uuid|exists:kebuns,id_kebun',
            'nama_blok' => 'required|string|max:100',
            'keterangan' => 'nullable|string',
            'luas_area' => 'nullable|numeric',
            'foto' => $this->aturanValidasiFoto(false),
        ];
    }
}
