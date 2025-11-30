<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * Class CorsMiddleware
 * 
 * Middleware untuk menangani Cross-Origin Resource Sharing (CORS).
 * CORS diperlukan ketika frontend dan backend berada di domain/port berbeda.
 * 
 * Dalam aplikasi ini:
 * - Backend (Laravel API): http://localhost:8000
 * - Frontend (React/Vue/etc): http://localhost:3000
 * 
 * Tanpa CORS, browser akan memblokir request dari frontend ke backend.
 * Middleware ini menambahkan header CORS yang diperlukan ke setiap response.
 */
class CorsMiddleware
{
    /**
     * Handle incoming request dan tambahkan CORS headers ke response
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        $response->headers->set('Access-Control-Allow-Origin', 'http://localhost:3000'); // Frontend URL
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN');
        $response->headers->set('Access-Control-Allow-Credentials', 'true');
        $response->headers->set('Access-Control-Max-Age', '86400');

        if ($request->getMethod() === "OPTIONS") {
            $response->setStatusCode(200);
        }

        return $response;
    }
}