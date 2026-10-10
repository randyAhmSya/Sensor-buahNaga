<?php
namespace App\Http\Requests\langganan;

use App\Traits\FileUploadTrait;
use Illuminate\Foundation\Http\FormRequest;

class AjukanPembelianLanggananRequest extends FormRequest
{
    use FileUploadTrait;

    public function authorize(): bool
    {
        return true; // scoping tenant selalu dari user login, bukan input client
    }

    public function rules(): array
    {
        return [
            'paket_langganan_id' => ['required', 'uuid', 'exists:paket_langganans,id_paket'],
            'bukti_transfer' => $this->aturanValidasiFoto(true),
        ];
    }
}