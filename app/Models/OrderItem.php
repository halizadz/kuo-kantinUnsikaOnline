<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class OrderItem
 * 
 * Model untuk tabel 'order_items' yang menyimpan detail item dalam pesanan.
 * OrderItem adalah junction/pivot table antara Order dan Menu.
 * 
 * Struktur:
 * - Satu Order memiliki banyak OrderItem
 * - Satu OrderItem merujuk ke satu Menu
 */
class OrderItem extends Model
{
    use HasFactory;

    /**
     * Kolom-kolom yang bisa diisi secara mass assignment
     */
    protected $fillable = [
        'order_id', // ID dari order induknya (foreign key ke orders)
        'menu_id',  // ID dari menu yang dipesan (foreign key ke menus)
        'quantity', // Jumlah item yang dipesan (integer)
        'price',    // Harga satuan item PADA SAAT dipesan (simpan harga agar tidak berubah)
    ];

    /**
     * Menonaktifkan timestamps (created_at, updated_at)
     * 
     * OrderItem tidak perlu timestamps karena:
     * - Waktu pembuatan sudah ada di Order
     * - OrderItem tidak pernah diupdate setelah dibuat
     * 
     * Jika Anda ingin tracking waktu, set ke true dan tambahkan
     * kolom timestamps di migration.
     */
    public $timestamps = false;

    /**
     * Relasi: OrderItem dimiliki oleh satu Order
     * 
     * Relasi Many-to-One (belongsTo):
     * - Banyak order items -> satu order
     * 
     * Foreign key: order_id
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Relasi: OrderItem merujuk ke satu Menu
     * 
     * Relasi Many-to-One (belongsTo):
     * - Banyak order items -> satu menu
     * 
     * Foreign key: menu_id
     * 
     * CATATAN PENTING:
     * Kita menyimpan harga di order_item untuk menjaga konsistensi data.
     * Meski harga menu berubah di kemudian hari, harga di order_item
     * tetap sesuai dengan harga saat order dibuat.
     */
    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class);
    }

    /**
     * Accessor untuk mendapatkan subtotal (harga x quantity)
     * 
     * Bisa diakses dengan: $orderItem->subtotal
     */
    public function getSubtotalAttribute()
    {
        return $this->price * $this->quantity;
    }
}