<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

/**
 * Class Authenticate
 * 
 * Middleware untuk memastikan user sudah terautentikasi.
 * Extends dari middleware bawaan Laravel untuk autentikasi.
 * 
 * Middleware ini akan:
 * - Mengecek apakah user sudah login
 * - Jika belum, akan mengembalikan response sesuai tipe request (JSON/redirect)
 */

class Authenticate extends Middleware
{
    /**
     * Menentukan kemana user akan di-redirect jika belum terautentikasi
     */
    protected function redirectTo(Request $request): ?string
    {
        // Untuk API, return null (tidak redirect, tapi return JSON error)
        if ($request->expectsJson()) {
            return null;
        }
        
        // Untuk web routes, redirect ke login page
        return route('login');
    }
}