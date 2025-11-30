<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Class Order
 * 
 * Model untuk tabel 'orders' yang menyimpan data pesanan.
 * Order dibuat oleh mahasiswa dan diproses oleh penjual.
 * Satu order hanya bisa berisi menu dari satu penjual.
 * 
 * Status flow:
 * pending -> processing -> ready -> on_delivery/completed
 * atau
 * pending -> cancelled
 */
class Order extends Model
{
    use HasFactory;

    /**
     * Kolom-kolom yang bisa diisi secara mass assignment
     */
    protected $fillable = [
        'user_id',          // ID pembeli (mahasiswa)
        'penjual_id',       // ID penjual (pemilik kantin)
        'order_number',     // Nomor order unik (ORD-XXXXX)
        'total_price',      // Total harga pesanan
        'status',           // Status order (pending, processing, ready, dll)
        'delivery_option',  // Opsi pengiriman: 'pickup' atau 'delivery'
        'delivery_address', // Alamat pengiriman (null jika pickup)
        'notes',            // Catatan tambahan dari pembeli
        'estimated_time'    // Estimasi waktu selesai
    ];

    /**
     * Casting tipe data kolom
     */
    protected $casts = [
        'estimated_time' => 'datetime', // Konversi ke Carbon instance
    ];

    /**
     * Relasi: Order dimiliki oleh satu User (pembeli/mahasiswa)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relasi: Order diproses oleh satu User (penjual)
     */
    public function penjual(): BelongsTo
    {
        return $this->belongsTo(User::class, 'penjual_id');
    }

    /**
     * Relasi: Order memiliki banyak OrderItem
     * 
     * Relasi One-to-Many (hasMany):
     * - Satu order -> banyak order items
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Relasi: Order memiliki banyak Rating
     * Rating diberikan setelah order completed
     */
    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    // ============================================
    // HELPER METHODS UNTUK CEK STATUS ORDER
    // ============================================

    /**
     * Cek apakah order masih pending (menunggu konfirmasi penjual)
     */
    public function isPending()
    {
        return $this->status === 'pending';
    }

    /**
     * Cek apakah order sedang diproses penjual
     */
    public function isProcessing()
    {
        return $this->status === 'processing';
    }

    /**
     * Cek apakah order sudah siap diambil/diantar
     */
    public function isReady()
    {
        return $this->status === 'ready';
    }

    /**
     * Cek apakah order sudah selesai
     */
    public function isCompleted()
    {
        return $this->status === 'completed';
    }

    /**
     * Cek apakah order dibatalkan
     */
    public function isCancelled()
    {
        return $this->status === 'cancelled';
    }

    /**
     * Cek apakah order sedang dalam pengiriman
     */
    public function isOnDelivery()
    {
        return $this->status === 'on_delivery';
    }

    // ============================================
    // HELPER METHODS UNTUK CEK DELIVERY OPTION
    // ============================================

    /**
     * Cek apakah order menggunakan delivery (diantar)
     */
    public function isDelivery()
    {
        return $this->delivery_option === 'delivery';
    }

    /**
     * Cek apakah order menggunakan pickup (ambil sendiri)
     */
    public function isPickup()
    {
        return $this->delivery_option === 'pickup';
    }

    // ============================================
    // HELPER METHODS UNTUK DISPLAY TEXT
    // ============================================

    /**
     * Mendapatkan teks status dalam Bahasa Indonesia
     * Untuk ditampilkan ke user
     */
    public function getStatusText()
    {
        // Mapping status code ke teks Indonesia
        $statuses = [
            'pending' => 'Menunggu Konfirmasi',
            'processing' => 'Sedang Diproses',
            'ready' => 'Siap Diambil',
            'on_delivery' => 'Sedang Diantar',
            'completed' => 'Selesai',
            'cancelled' => 'Dibatalkan'
        ];

        // Return teks Indonesia atau status asli jika tidak ada mapping
        return $statuses[$this->status] ?? $this->status;
    }

    /**
     * Mendapatkan teks delivery option dalam Bahasa Indonesia
     */
    public function getDeliveryOptionText()
    {
        return $this->isDelivery() ? 'Diantar' : 'Ambil Sendiri';
    }
}