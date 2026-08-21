<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'progress',
        'color',
        'members',
        'days_left',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'progress' => 'integer',
            'members' => 'integer',
            'days_left' => 'integer',
        ];
    }
}
