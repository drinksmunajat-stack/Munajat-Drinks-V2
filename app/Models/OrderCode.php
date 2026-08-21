<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderCode extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'order_code',
        'cabang_id',
        'customer_name',
        'total_amount',
        'payment_method',
        'payment_status',
        'order_status',
        'notes',
        'items_data',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'total_amount' => 'decimal:2',
            'items_data' => 'array',
        ];
    }

    /**
     * @return BelongsTo<Cabang, $this>
     */
    public function cabang(): BelongsTo
    {
        return $this->belongsTo(Cabang::class);
    }
}
