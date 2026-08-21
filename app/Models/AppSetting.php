<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'email_notifications',
        'push_notifications',
        'weekly_digest',
        'bg_mode',
        'transparency',
        'color_mode',
        'two_factor_enabled',
        'session_timeout',
        'auth_security_level',
        'plan_name',
        'plan_billing_cycle',
        'plan_price',
        'plan_status',
        'payment_gateway',
        'merchant_id',
        'billing_email',
    ];

    protected function casts(): array
    {
        return [
            'email_notifications' => 'boolean',
            'push_notifications' => 'boolean',
            'weekly_digest' => 'boolean',
            'transparency' => 'boolean',
            'two_factor_enabled' => 'boolean',
            'session_timeout' => 'integer',
            'plan_price' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
