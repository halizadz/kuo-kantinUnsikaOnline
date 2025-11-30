<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * Class CheckAdmin
 * 
 * Middleware untuk memastikan hanya user dengan role 'admin' yang bisa akses.
 * Digunakan untuk protect route-route khusus admin seperti:
 * - Manajemen users
 * - Approval penjual
 * - Lihat semua data sistem
 * - Export data
 */
class CheckAdmin
{
    /**
     * Handle incoming request dan cek apakah user adalah admin
     */
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya admin yang bisa akses fitur ini'
            ], 403);
        }

        return $next($request);
    }
}