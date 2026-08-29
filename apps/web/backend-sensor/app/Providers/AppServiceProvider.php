<?php

namespace App\Providers;

use App\Models\kebun;
use App\Models\Tenant;
use App\Models\User;
use App\Traits\admin_acces\KebunPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::define('update', function (User $user, kebun $kebun) {
            if ($user->role === 'superAdmin') {
                $tenant = Tenant::where('tenant_id', $kebun->tenant_id)->first();
                return $tenant && $tenant->is_admin_allowed === true;
            }
            return $user->tenant_id === $kebun->tenant_id;
        });

        Gate::define('delete', function (User $user, kebun $kebun) {
            if ($user->role === 'superAdmin') {
                $tenant = Tenant::where('tenant_id', $kebun->tenant_id)->first();
                return $tenant && $tenant->is_admin_allowed === true;
            }
            return $user->tenant_id === $kebun->tenant_id;
        });
    }
}
