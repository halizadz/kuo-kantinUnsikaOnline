<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckApprovedPenjual
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->isPenjual()) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya penjual yang bisa akses fitur ini'
            ], 403);
        }

        if (!$request->user()->is_approved) {
            return response()->json([
                'success' => false,
                'message' => 'Akun penjual Anda belum disetujui admin'
            ], 403);
        }

        return $next($request);
    }
}
