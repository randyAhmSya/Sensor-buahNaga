<?php

namespace App\Traits\admin_acces;

use App\Models\kebun;
use App\Models\User;
use App\Policies\Concerns\HandlesTenantAccess;
use App\Traits\concern\HandlesTenantAccess as ConcernHandlesTenantAccess;

class KebunPolicy
{
    use ConcernHandlesTenantAccess;

    public function view(User $user, kebun $kebun): bool
    {
        return $this->canAccessTenant($user, $kebun->tenant_id);
    }
    public function update(User $user, kebun $kebun): bool
    {
        return $this->canAccessTenant($user, $kebun->tenant_id);
    }
    public function delete(User $user, kebun $kebun): bool
    {
        return $this->canAccessTenant($user, $kebun->tenant_id);
    }
}
