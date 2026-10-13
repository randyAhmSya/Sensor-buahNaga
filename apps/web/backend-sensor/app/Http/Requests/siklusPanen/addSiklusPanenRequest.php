<?php

namespace App\Http\Requests\siklusPanen;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class addSiklusPanenRequest extends FormRequest
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
            'block_id'                        => 'required|uuid|exists:bloks,id_blok',
            'tanggal_penyinaran'               => 'required|date',
            'target_hari_berbunga'             => 'nullable|integer|min:1',
            'target_hari_panen_setelah_bunga'  => 'nullable|integer|min:1',
        ];
    }
}
