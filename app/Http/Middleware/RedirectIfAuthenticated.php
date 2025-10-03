<?php

namespace App\Http\Middleware;

use App\Providers\RouteServiceProvider;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated
{
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                $user = Auth::guard($guard)->user();
                
                // Redirect berdasarkan role
                if ($request->expectsJson()) {
                    // Untuk API, return error JSON
                    return response()->json([
                        'success' => false,
                        'message' => 'Anda sudah login'
                    ], 403);
                }
                
                if ($user->isAdmin()) {
                    return redirect('/admin/dashboard');
                } elseif ($user->isPenjual()) {
                    return $user->is_approved 
                        ? redirect('/penjual/dashboard')
                        : redirect('/penjual/pending');
                } else {
                    return redirect('/dashboard');
                }
            }
        }

        return $next($request);
    }
}