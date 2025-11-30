<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Class CheckPenjualApproved
 * 
 * Middleware untuk memastikan user adalah penjual yang sudah disetujui admin.
 * Middleware ini melakukan 3 level checking dengan logging detail:
 * 1. User harus sudah login (authenticated)
 * 2. User harus penjual (role = 'penjual')
 * 3. Penjual harus sudah approved (is_approved = true)
 * 
 * Digunakan untuk protect fitur-fitur utama penjual seperti:
 * - CRUD menu
 * - Terima dan proses order
 * - Lihat dashboard penjualan
 */
class CheckPenjualApproved
{
    /**
     * Handle incoming request dengan detailed checking dan logging
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        
        // Log informasi middleware untuk debugging dan monitoring
        Log::info('CheckPenjualApproved Middleware', [
            'user_id' => $user?->id,
            'role' => $user?->role,
            'is_approved' => $user?->is_approved
        ]);

        // Cek level 1: Apakah user sudah login?
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        // Cek level 2: Apakah user adalah penjual?
        if ($user->role !== 'penjual') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya penjual yang bisa akses fitur ini'
            ], 403);
        }

         // Cek level 3: Apakah penjual sudah diapprove?
        if (!$user->is_approved) {
            return response()->json([
                'success' => false,
                'message' => 'Akun penjual Anda belum disetujui admin'
            ], 403);
        }

        return $next($request);
    }
}