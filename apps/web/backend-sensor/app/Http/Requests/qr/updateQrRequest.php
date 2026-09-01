<?php

namespace App\Http\Requests\qr;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class updateQrRequest extends FormRequest
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
        $qrId = $this->route('qr');
        return [
            'teks_kode_qr' => [
                'sometimes',
                'string',
                Rule::unique('kode_qrs', 'teks_kode_qr')->ignore($qrId, 'id_qr')
            ],
            'status_qr'    => 'sometimes|boolean',
        ];
    }
}
