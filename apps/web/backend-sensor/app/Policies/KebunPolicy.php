<?php

namespace App\Policies;

use App\Models\Kebun;
use App\Models\User;
use App\Traits\concern\HandlesTenantAccess;

class KebunPolicy
{
    use HandlesTenantAccess;

    public function view(User $user, Kebun $kebun): bool
    {
        return $this->canAccessTenant($user, $kebun->tenant_id);
    }

    public function update(User $user, Kebun $kebun): bool
    {
        return $this->canAccessTenant($user, $kebun->tenant_id);
    }

    public function delete(User $user, Kebun $kebun): bool
    {
        return $this->canAccessTenant($user, $kebun->tenant_id);
    }
}
