<?php

namespace App\Http\Controllers\petani;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Traits\ApiResponser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TenantAccessController extends Controller
{
    use ApiResponser;
    public function toggleAccess(Request $request): JsonResponse
    {
        $request->validate([
            'is_admin_allowed' => ['required', 'boolean'],
        ]);

        $tenant = Tenant::find($request->user()->tenant_id);

        if (!$tenant) {
            return $this->errorResponse('Data tenant tidak ditemukan.', 404);
        }

        $tenant->update([
            'is_admin_allowed' => $request->input('is_admin_allowed'),
        ]);

        $status = $tenant->is_admin_allowed ? 'diberikan' : 'dicabut';

        return $this->successResponse(
            $tenant,
            "Izin akses Super Admin berhasil {$status}."
        );
    }

    public function getStatus(Request $request): JsonResponse
    {
        $tenant = Tenant::find($request->user()->tenant_id);

        if (!$tenant) {
            return $this->errorResponse('Data tenant tidak ditemukan.', 404);
        }

        return $this->successResponse([
            'is_admin_allowed' => (bool) $tenant->is_admin_allowed,
        ], 'Status izin akses Super Admin berhasil diambil.');
    }
}
