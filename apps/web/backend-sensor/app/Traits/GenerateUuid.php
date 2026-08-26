<?php

namespace App\Traits;

use Illuminate\Support\Str;

trait GenerateUuid
{
    protected static function bootGenerateUuid()
    {
        static::creating(function ($model) {
            $primaryKey = $model->getKeyName();
            if (empty($model->{$primaryKey})) {
                $model->{$primaryKey} = (string) Str::uuid();
            }
        });
    }
    public function getincrementing(): bool
    {
        return false;
    }
    public function getKeyType(): string
    {
        return 'string';
    }
}
