<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

/**
 * Class VerifyCsrfToken
 * 
 * Middleware untuk proteksi terhadap CSRF (Cross-Site Request Forgery) attack.
 * Extends dari middleware bawaan Laravel.
 * 
 * CSRF Attack adalah serangan dimana attacker membuat korban mengirim
 * request tanpa sepengetahuan mereka, contoh:
 * - User login di aplikasi A
 * - User buka website jahat B
 * - Website B punya form yang submit ke aplikasi A
 * - Tanpa CSRF protection, request ini akan berhasil
 * 
 * Laravel mencegah ini dengan CSRF token:
 * - Setiap form harus include token unik
 * - Token divalidasi setiap ada POST/PUT/DELETE request
 * - Token tidak valid = request ditolak
 * 
 * Untuk API, CSRF protection biasanya di-disable karena:
 * - API menggunakan token authentication (Bearer token)
 * - CSRF hanya masalah untuk cookie-based authentication
 */
class VerifyCsrfToken extends Middleware
{
    /**
     * Daftar URI yang di-exclude dari CSRF verification
     */
    protected $except = [
        // Semua API routes di-exclude karena pakai Bearer token authentication
        'api/*',
        
        // Sanctum endpoint untuk get CSRF cookie
        // Endpoint ini memang khusus untuk generate CSRF token
        'sanctum/csrf-cookie',
        
        // Webhook untuk payment gateway
        // Webhook tidak bisa include CSRF token karena dikirim dari server external
        // Pastikan webhook endpoints punya validasi signature/secret lain
        'webhook/midtrans',   // Webhook Midtrans payment gateway
        'webhook/xendit',     // Webhook Xendit payment gateway
    ];
}