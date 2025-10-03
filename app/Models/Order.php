<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'penjual_id',
        'order_number',
        'total_price',
        'status',
        'delivery_option', // 'pickup' atau 'delivery'
        'delivery_address',
        'notes',
        'estimated_time'
    ];

    protected $casts = [
        'estimated_time' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function penjual(): BelongsTo
    {
        return $this->belongsTo(User::class, 'penjual_id');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    // Helper methods untuk status
    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function isProcessing()
    {
        return $this->status === 'processing';
    }

    public function isReady()
    {
        return $this->status === 'ready';
    }

    public function isCompleted()
    {
        return $this->status === 'completed';
    }

    public function isCancelled()
    {
        return $this->status === 'cancelled';
    }

    public function isOnDelivery()
    {
        return $this->status === 'on_delivery';
    }

    // Helper untuk delivery option
    public function isDelivery()
    {
        return $this->delivery_option === 'delivery';
    }

    public function isPickup()
    {
        return $this->delivery_option === 'pickup';
    }

    // Get status text untuk display
    public function getStatusText()
    {
        $statuses = [
            'pending' => 'Menunggu Konfirmasi',
            'processing' => 'Sedang Diproses',
            'ready' => 'Siap Diambil',
            'on_delivery' => 'Sedang Diantar',
            'completed' => 'Selesai',
            'cancelled' => 'Dibatalkan'
        ];

        return $statuses[$this->status] ?? $this->status;
    }

    // Get delivery option text
    public function getDeliveryOptionText()
    {
        return $this->isDelivery() ? 'Diantar' : 'Ambil Sendiri';
    }
}