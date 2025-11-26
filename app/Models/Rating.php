<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rating extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'user_id',
        'penjual_id',
        'menu_id',
        'rating',
        'review'
    ];

    protected $casts = [
        'rating' => 'decimal:1'
    ];

    // Relationships
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function penjual()
    {
        return $this->belongsTo(User::class, 'penjual_id');
    }

    public function menu()
    {
        return $this->belongsTo(Menu::class);
    }
}