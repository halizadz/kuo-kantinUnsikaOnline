<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage; // <-- Tambahkan ini

class Menu extends Model
{
    use HasFactory;

    protected $fillable = [
        'penjual_id',
        'name',
        'description',
        'price',
        'image', // Kolom ini sudah ada, bagus!
        'is_available',
        'prep_time',
        'rating',
        'rating_count',
        'is_popular'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_available' => 'boolean',
        'is_popular' => 'boolean',
        'rating' => 'decimal:2'
    ];
    
    // TAMBAHKAN BAGIAN INI UNTUK MEMBUAT URL GAMBAR OTOMATIS
    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        if ($this->image) {
            // Ini akan menghasilkan URL lengkap ke file gambar di storage
            return Storage::url($this->image);
        }
        // Return URL placeholder jika tidak ada gambar
        return 'https://placehold.co/600x400/EEE/31343C?text=No+Image';
    }
    // AKHIR BAGIAN TAMBAHAN

    public function penjual()
    {
        return $this->belongsTo(User::class, 'penjual_id');
    }
}
