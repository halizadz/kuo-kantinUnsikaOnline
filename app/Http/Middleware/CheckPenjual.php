<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CheckPenjual
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        
        Log::info('CheckPenjual Middleware', [
            'user_id' => $user?->id,
            'role' => $user?->role,
            'is_approved' => $user?->is_approved,
            'path' => $request->path()
        ]);

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