<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\TrimStrings as Middleware;

/**
 * Class TrimStrings
 * 
 * Middleware untuk otomatis trim (hapus spasi di awal dan akhir) 
 * dari semua input string yang dikirim user.
 * Extends dari middleware bawaan Laravel.
 * 
 * Contoh:
 * Input: "  john@example.com  " -> Menjadi: "john@example.com"
 * Input: " John Doe " -> Menjadi: "John Doe"
 * 
 * Ini mencegah error yang disebabkan oleh spasi tidak sengaja,
 * terutama pada field email, username, dll.
 * 
 * Beberapa field seperti password perlu di-exclude karena:
 * - Spasi di password mungkin disengaja oleh user
 * - Trim password bisa menyebabkan login gagal
 */
class TrimStrings extends Middleware
{
    /**
     * Daftar nama field yang TIDAK akan di-trim
     */
    protected $except = [
        'current_password',      // Password saat ini
        'password',              // Password baru
        'password_confirmation', // Konfirmasi password
    ];
}