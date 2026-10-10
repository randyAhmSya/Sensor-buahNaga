<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use App\Traits\ApiResponser;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    use ApiResponser;

    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function register(RegisterRequest $request)
    {
        $user = $this->authService->registerUser($request->validated());
        $token = $this->authService->createNewToken($user);

        return $this->successResponse([
            'user' => $user,
            'token' => $token
        ], 'Registrasi berhasil. Selamat datang di AgroLight!', 201);
    }

    public function login(LoginRequest $request)
    {
        $user = $this->authService->checkCredential($request->email, $request->password);

        if (! $user) {
            return $this->errorResponse('Email atau password salah.', 401);
        }

        if (! $user->is_aktif) {
            return $this->errorResponse('Akun ini dinonaktifkan. Hubungi admin AgroLight.', 403);
        }

        $token = $this->authService->createNewToken($user);

        return $this->successResponse([
            'user' => $user,
            'role' => $user->role,
            'token' => $token
        ], 'Login sukses.');
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return $this->successResponse(null, 'Berhasil logout.');
    }
}