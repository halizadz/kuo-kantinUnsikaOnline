<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class CheckApprovedPenjual
 * 
 * Middleware untuk memastikan user adalah penjual yang sudah disetujui admin.
 * Middleware ini melakukan 2 level checking:
 * 1. User harus penjual (role = 'penjual')
 * 2. Penjual harus sudah approved (is_approved = true)
 * 
 * Digunakan untuk protect fitur-fitur penjual yang hanya bisa diakses
 * setelah akun mereka disetujui admin.
 */

class CheckApprovedPenjual
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Cek level 1: Apakah user adalah penjual?
        if (!$request->user() || !$request->user()->isPenjual()) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya penjual yang bisa akses fitur ini'
            ], 403);
        }

        // Cek level 2: Apakah penjual sudah diapprove admin?
        if (!$request->user()->is_approved) {
            return response()->json([
                'success' => false,
                'message' => 'Akun penjual Anda belum disetujui admin'
            ], 403);
        }

        return $next($request);
    }
}
