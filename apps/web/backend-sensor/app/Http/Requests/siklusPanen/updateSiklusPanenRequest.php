<?php

namespace App\Http\Requests\siklusPanen;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class updateSiklusPanenRequest extends FormRequest
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
            'target_hari_berbunga'             => 'sometimes|integer|min:1',
            'tanggal_berbunga_aktual'          => 'sometimes|nullable|date',
            'target_hari_panen_setelah_bunga'  => 'sometimes|integer|min:1',
            'tanggal_panen'                     => 'sometimes|nullable|date',
            'status_siklus'                     => 'sometimes|string|in:BERJALAN,SELESAI,GAGAL',
        ];
    }
}
