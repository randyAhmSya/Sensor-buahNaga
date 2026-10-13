<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\userAdmin\StoreUserRequest;
use App\Models\User;
use App\Services\management_admin\UserAdminService;
use App\Traits\ApiResponser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserAdminController extends Controller
{
    use ApiResponser;

    private const PESAN_USER_TIDAK_DITEMUKAN = 'User tidak ditemukan.';

    public function __construct(protected UserAdminService $userAdminService) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = max(1, min((int) $request->query('per_page', 15), 100));
        $paginator = $this->userAdminService->getSemuaUser(
            $request->query('tenant_id'),
            $request->query('role'),
            $perPage
        );

        return $this->successResponse($paginator->items(), null, 200, $this->paginationMeta($paginator));
    }

    public function show(string $id): JsonResponse
    {
        $user = $this->userAdminService->getUserById($id);
        if (!$user) {
            return $this->errorResponse(self::PESAN_USER_TIDAK_DITEMUKAN, 404);
        }

        return $this->successResponse($user);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = $this->userAdminService->buatUser($request->validated(), $request->user()->id);
        return $this->successResponse($user, 'User berhasil dibuat.', 201);
    }

    public function nonaktifkan(Request $request, string $id): JsonResponse
    {
        $user = User::find($id);
        if (!$user) {
            return $this->errorResponse(self::PESAN_USER_TIDAK_DITEMUKAN, 404);
        }

        if ($user->id === $request->user()->id) {
            return $this->errorResponse('Tidak bisa menonaktifkan akun sendiri.', 422);
        }

        $this->userAdminService->nonaktifkanUser($user, $request->user()->id);
        return $this->successResponse($user->fresh(), 'User dinonaktifkan.');
    }

    public function aktifkan(Request $request, string $id): JsonResponse
    {
        $user = User::find($id);
        if (!$user) {
            return $this->errorResponse(self::PESAN_USER_TIDAK_DITEMUKAN, 404);
        }

        $this->userAdminService->aktifkanUser($user, $request->user()->id);
        return $this->successResponse($user->fresh(), 'User diaktifkan kembali.');
    }
}