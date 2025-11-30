<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class CheckMahasiswa
 * 
 * Middleware untuk memastikan hanya user dengan role 'mahasiswa' yang bisa akses.
 * Digunakan untuk protect route-route khusus mahasiswa seperti:
 * - Membuat pesanan
 * - Melihat riwayat pesanan
 * - Memberikan rating
 * - Fitur-fitur customer lainnya
 */
class CheckMahasiswa
{
    /**
     * Handle incoming request dan cek apakah user adalah mahasiswa
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Cek apakah user sudah login DAN user adalah mahasiswa
        if (!$request->user() || !$request->user()->isMahasiswa()) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya mahasiswa yang bisa akses fitur ini'
            ], 403);
        }

        return $next($request);
    }
}
