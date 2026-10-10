<?php

namespace App\Http\Requests\userAdmin;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_lengkap' => 'required|string|max:100',
            'email' => 'required|email|max:100|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:petani_biasa,superAdmin',
            'tenant_id' => 'required_if:role,petani_biasa|prohibited_if:role,superAdmin|uuid|exists:tenants,tenant_id',
        ];
    }
}