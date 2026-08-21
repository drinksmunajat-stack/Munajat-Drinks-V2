<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BillingInvoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'plan_name',
        'amount',
        'payment_method',
        'status',
        'billing_date',
        'due_date',
        'download_url',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'billing_date' => 'date',
            'due_date' => 'date',
        ];
    }
}
