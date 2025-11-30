<?php

namespace App\Http\Middleware;

use App\Providers\RouteServiceProvider;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class RedirectIfAuthenticated
 * 
 * Middleware untuk redirect user yang sudah login.
 * Mencegah user yang sudah login untuk akses halaman login/register.
 * 
 * Contoh use case:
 * - User sudah login, coba akses /login -> redirect ke dashboard
 * - User sudah login, coba akses /register -> redirect ke dashboard
 * 
 * Redirect berbeda berdasarkan role user:
 * - Admin -> /admin/dashboard
 * - Penjual (approved) -> /penjual/dashboard
 * - Penjual (pending) -> /penjual/pending
 * - Mahasiswa -> /dashboard
 */
class RedirectIfAuthenticated
{
    /**
     * Handle incoming request
     */
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        // Jika tidak ada guard yang ditentukan, gunakan default guard
        $guards = empty($guards) ? [null] : $guards;

        // Loop setiap guard (biasanya hanya 1: web atau api)
        foreach ($guards as $guard) {
            // Cek apakah user sudah login dengan guard ini
            if (Auth::guard($guard)->check()) {
                $user = Auth::guard($guard)->user();
                
                // Untuk API request, return JSON error
                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Anda sudah login'
                    ], 403);
                }
                
                // Untuk web request, redirect berdasarkan role
                
                // Admin -> dashboard admin
                if ($user->isAdmin()) {
                    return redirect('/admin/dashboard');
                } 
                // Penjual -> dashboard penjual atau halaman pending
                elseif ($user->isPenjual()) {
                    // Jika penjual sudah approved -> dashboard
                    // Jika belum approved -> halaman pending (menunggu approval)
                    return $user->is_approved 
                        ? redirect('/penjual/dashboard')
                        : redirect('/penjual/pending');
                } 
                // Mahasiswa atau role lain -> dashboard umum
                else {
                    return redirect('/dashboard');
                }
            }
        }

        // Jika user belum login, lanjutkan ke controller (halaman login/register)
        return $next($request);
    }
}