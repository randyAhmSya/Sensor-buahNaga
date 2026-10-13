<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Services\management_admin\DashboardAdminService;
use App\Traits\ApiResponser;

class DashboardAdminController extends Controller
{
    use ApiResponser;
    public function __construct(private DashboardAdminService $dashboardAdminService) {}

    public function ringkasan()
    {
        $data = $this->dashboardAdminService->getRingkasan();

        return $this->successResponse($data, 'Ringkasan dashboard berhasil diambil');
    }
}