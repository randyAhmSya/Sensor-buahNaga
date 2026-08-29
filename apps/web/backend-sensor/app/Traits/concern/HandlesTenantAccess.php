<?php

namespace App\Traits\concern;

use App\Models\Tenant;
use App\Models\User;

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
            $tenant = Tenant::find($targetTenantId);
            return $tenant ? (bool) $tenant->is_admin_allowed : false;
        }

        return false;
    }
}
