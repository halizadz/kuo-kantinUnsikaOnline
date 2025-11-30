<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Rating
 * 
 * Model untuk tabel 'ratings' yang menyimpan rating dan review dari pembeli.
 * Rating diberikan setelah order selesai (completed).
 * 
 * Struktur rating:
 * - Setiap order yang completed bisa diberi rating
 * - Rating diberikan untuk menu yang dipesan
 * - Rating range: 1-5 (bintang)
 * - Review opsional (text ulasan)
 */
class Rating extends Model
{
    use HasFactory;

    /**
     * Kolom-kolom yang bisa diisi secara mass assignment
     */
    protected $fillable = [
        'order_id',    // ID order yang diberi rating (foreign key ke orders)
        'user_id',     // ID pemberi rating/mahasiswa (foreign key ke users)
        'penjual_id',  // ID penjual yang menerima rating (foreign key ke users)
        'menu_id',     // ID menu yang diberi rating (foreign key ke menus)
        'rating',      // Nilai rating 1-5
        'review'       // Text ulasan (opsional)
    ];

    /**
     * Casting tipe data kolom
     */
    protected $casts = [
        'rating' => 'decimal:1' // Rating dengan 1 desimal (contoh: 4.5)
    ];

    /**
     * Relasi: Rating dimiliki oleh satu Order
     * 
     * Relasi Many-to-One (belongsTo):
     * - Banyak ratings -> satu order
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Relasi: Rating diberikan oleh satu User (pembeli/mahasiswa)
     * 
     * Relasi Many-to-One (belongsTo):
     * - Banyak ratings -> satu user
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi: Rating ditujukan untuk satu User (penjual)
     * 
     * Relasi Many-to-One (belongsTo):
     * - Banyak ratings -> satu penjual
     * 
     * Foreign key: penjual_id (bukan user_id)
     */
    public function penjual()
    {
        return $this->belongsTo(User::class, 'penjual_id');
    }

    /**
     * Relasi: Rating diberikan untuk satu Menu
     * 
     * Relasi Many-to-One (belongsTo):
     * - Banyak ratings -> satu menu
     * 
     * Rating mempengaruhi rating rata-rata menu.
     */
    public function menu()
    {
        return $this->belongsTo(Menu::class);
    }

    /**
     * Helper method untuk mendapatkan rating dalam format bintang
     */
    public function getStarsDisplay()
    {
        $fullStars = floor($this->rating);
        $emptyStars = 5 - $fullStars;
        
        return str_repeat('★', $fullStars) . str_repeat('☆', $emptyStars);
    }

    /**
     * Scope untuk filter rating berdasarkan rating minimum
     */
    public function scopeMinimumRating($query, $minRating)
    {
        return $query->where('rating', '>=', $minRating);
    }

    /**
     * Scope untuk filter rating dengan review (ada text ulasan)
     */
    public function scopeWithReview($query)
    {
        return $query->whereNotNull('review')->where('review', '!=', '');
    }
}