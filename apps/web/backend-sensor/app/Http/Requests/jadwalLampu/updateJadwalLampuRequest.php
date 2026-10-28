<?php

namespace App\Http\Requests\jadwalLampu;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class updateJadwalLampuRequest extends FormRequest
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
            'jam_mulai_nyala'     => 'sometimes|date_format:H:i',
            'jam_akhir_nyala'     => 'sometimes|date_format:H:i',
            'mode'                => 'sometimes|in:manual,auto',
            'instensitas_cahaya'  => 'sometimes|nullable|numeric|min:0|max:100',
            'target_lux'          => 'sometimes|nullable|numeric|min:0',
            'intensitas_minimum'  => 'sometimes|numeric|min:0|max:100',
            'baseline_manual_persen' => 'sometimes|nullable|numeric|min:0|max:100',
            'status_aktif'        => 'sometimes|boolean',
            'keterangan'          => 'sometimes|nullable|string',
        ];
    }
}