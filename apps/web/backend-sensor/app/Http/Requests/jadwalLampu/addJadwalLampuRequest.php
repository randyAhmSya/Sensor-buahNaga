<?php

namespace App\Http\Requests\jadwalLampu;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class addJadwalLampuRequest extends FormRequest
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
            'kebun_id'            => 'nullable|uuid|exists:kebuns,id_kebun|required_without:sensor_id|prohibits:sensor_id',
            'sensor_id'           => 'nullable|uuid|exists:node_sensors,id_sensor|required_without:kebun_id|prohibits:kebun_id',
            'jam_mulai_nyala'     => 'required|date_format:H:i',
            'jam_akhir_nyala'     => 'required|date_format:H:i',
            'mode'                => 'required|in:manual,auto',
            'instensitas_cahaya'  => 'required_if:mode,manual|nullable|numeric|min:0|max:100',
            'target_lux'          => 'required_if:mode,auto|nullable|numeric|min:0',
            'intensitas_minimum'  => 'nullable|numeric|min:0|max:100',
            'keterangan'          => 'nullable|string',
        ];
    }
}