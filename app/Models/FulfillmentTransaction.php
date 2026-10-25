<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FulfillmentTransaction extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'attempts' => 'integer',
        'raw_response' => 'array',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
