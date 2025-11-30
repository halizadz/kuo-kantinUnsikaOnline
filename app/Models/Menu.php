<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

/**
 * Class Menu
 * 
 * Model untuk tabel 'menus' yang menyimpan data menu makanan/minuman.
 * Menu dimiliki oleh penjual dan bisa dipesan oleh mahasiswa.
 * 
 * Fitur:
 * - CRUD menu
 * - Rating system
 * - Image upload
 * - Availability toggle
 * - Popular flag
 */
class Menu extends Model
{
    use HasFactory;

    /**
     * Kolom-kolom yang bisa diisi secara mass assignment
     */
    protected $fillable = [
        'penjual_id',    // ID pemilik menu (foreign key ke users)
        'name',          // Nama menu
        'description',   // Deskripsi menu
        'price',         // Harga menu
        'image',         // Path file gambar menu
        'is_available',  // Status ketersediaan (boolean)
        'prep_time',     // Waktu persiapan dalam menit
        'rating',        // Rating rata-rata (1-5)
        'rating_count',  // Jumlah rating yang diterima
        'is_popular'     // Flag menu populer (boolean)
    ];

    /**
     * Casting tipe data kolom
     * Memastikan data dikonversi ke tipe yang benar saat diakses
     */
    protected $casts = [
        'price' => 'decimal:2',        // Harga dengan 2 desimal (Rp 15000.00)
        'is_available' => 'boolean',   // Konversi 0/1 ke false/true
        'is_popular' => 'boolean',     // Konversi 0/1 ke false/true
        'rating' => 'decimal:2'        // Rating dengan 2 desimal (4.50)
    ];
    
    /**
     * Atribut tambahan yang akan di-append ke JSON/Array
     * Atribut ini tidak ada di database, tapi digenerate otomatis
     */
    protected $appends = ['image_url'];

    /**
     * Accessor untuk mendapatkan URL lengkap gambar menu
     */
    public function getImageUrlAttribute()
    {
        // Cek apakah menu punya gambar
        if ($this->image) {
            // Generate URL lengkap ke file gambar di storage/app/public
            // Contoh: http://localhost:8000/storage/menu-images/abc123.jpg
            return Storage::url($this->image);
        }
        
        // Return URL placeholder jika tidak ada gambar
        // Placeholder dari placehold.co dengan ukuran 600x400
        return 'https://placehold.co/600x400/EEE/31343C?text=No+Image';
    }

    /**
     * Relasi: Menu dimiliki oleh satu User (penjual)
     * 
     * Relasi Many-to-One (belongsTo):
     * - Satu menu -> satu penjual
     * - Banyak menu -> satu penjual
     */
    public function penjual()
    {
        return $this->belongsTo(User::class, 'penjual_id');
    }
}