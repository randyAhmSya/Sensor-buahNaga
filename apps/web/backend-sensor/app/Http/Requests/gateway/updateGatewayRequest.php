<?php

namespace App\Http\Requests\gateway;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class updateGatewayRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Atribut gateway (kode, blok, token, status) dikelola server lewat pairing
     * dan reset pairing, bukan lewat form. Kolom nama_gateway/mac_address/status
     * yang dulu ada di sini tidak ada di tabel, dan aturan unique pada mac_address
     * menyebabkan error 500. Dengan rules kosong, validated() selalu kosong
     * sehingga update tidak bisa memindahkan gateway ke blok atau tenant lain.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [];
    }
}
