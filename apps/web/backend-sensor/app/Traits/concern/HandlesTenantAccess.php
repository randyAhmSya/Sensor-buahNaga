<?php

namespace App\Traits\concern;

use App\Models\User;
use App\Services\management_admin\AksesTenantService;

trait HandlesTenantAccess
{
    protected function canAccessTenant(User $user, ?string $targetTenantId): bool
    {
        if (!$targetTenantId) {
            return false;
        }

        if ($user->tenant_id === $targetTenantId) {
            return true;
        }

        if ($user->role === 'superAdmin') {
            return app(AksesTenantService::class)->bolehAkses($targetTenantId, $user->id);
        }

        return false;
    }
}
