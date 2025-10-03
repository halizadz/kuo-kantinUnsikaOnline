<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order_id', // ID dari order induknya
        'menu_id',  // ID dari menu yang dipesan
        'quantity', // Jumlah item yang dipesan
        'price',    // Harga satuan item pada saat dipesan
    ];

    /**
     * Menonaktifkan timestamps (created_at, updated_at) jika tidak dibutuhkan
     * Hapus baris ini jika Anda ingin menyimpan waktu pembuatan setiap item.
     * * @var bool
     */
    public $timestamps = false;

    /**
     * Mendefinisikan relasi "satu item pesanan dimiliki oleh satu order".
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Mendefinisikan relasi "satu item pesanan merujuk ke satu menu".
     * (Asumsi Anda memiliki model Menu.php)
     */
    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class);
    }
}
