<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CheckPenjualApproved
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        
        Log::info('CheckPenjualApproved Middleware', [
            'user_id' => $user?->id,
            'role' => $user?->role,
            'is_approved' => $user?->is_approved
        ]);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        if ($user->role !== 'penjual') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya penjual yang bisa akses fitur ini'
            ], 403);
        }

        if (!$user->is_approved) {
            return response()->json([
                'success' => false,
                'message' => 'Akun penjual Anda belum disetujui admin'
            ], 403);
        }

        return $next($request);
    }
}