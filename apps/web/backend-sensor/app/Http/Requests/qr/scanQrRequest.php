<?php
 
namespace App\Http\Requests\qr;
 
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
 
class scanQrRequest extends FormRequest
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
            'teks_kode_qr' => 'required|string',
            'platform'     => 'nullable|string|in:android,ios',
            'latitude'     => 'nullable|numeric',
            'longitude'    => 'nullable|numeric',
        ];
    }
}
 
