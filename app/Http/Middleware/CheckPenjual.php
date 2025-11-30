<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Class CheckPenjual
 * 
 * Middleware untuk memastikan user adalah penjual (tanpa cek approval).
 * Berbeda dengan CheckApprovedPenjual, middleware ini HANYA cek role,
 * tidak peduli apakah penjual sudah diapprove atau belum.
 * 
 * Digunakan untuk route yang bisa diakses penjual meski belum approved,
 * misalnya:
 * - Melihat status approval
 * - Update profile
 * - Logout
 */
class CheckPenjual
{
    /**
     * Handle incoming request dan cek apakah user adalah penjual
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        
        // Log informasi untuk debugging
        Log::info('CheckPenjual Middleware', [
            'user_id' => $user?->id,
            'role' => $user?->role,
            'is_approved' => $user?->is_approved,
            'path' => $request->path()
        ]);

         // Cek apakah user adalah penjual
        if (!$user || $user->role !== 'penjual') {
            Log::warning('CheckPenjual: Access Denied - Bukan penjual', [
                'has_user' => !is_null($user),
                'user_role' => $user?->role
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Hanya penjual yang bisa akses fitur ini'
            ], 403);
        }

        Log::info('CheckPenjual: Access Granted');
        return $next($request);
    }
}