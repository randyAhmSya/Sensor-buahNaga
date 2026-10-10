<?php

namespace App\Http\Requests\langganan;

use Illuminate\Foundation\Http\FormRequest;

class TolakTransaksiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'alasan' => 'required|string|min:5|max:500',
        ];
    }
}