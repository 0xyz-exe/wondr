<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'input_fields' => 'array',
        'is_active' => 'boolean',
    ];

    public function products()
    {
        return $this->hasMany(Product::class)->where('is_active', true)->orderBy('sort_order');
    }

    public function allProducts()
    {
        return $this->hasMany(Product::class)->orderBy('sort_order');
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
