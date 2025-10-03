<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        // Semua API routes di-exclude dari CSRF protection
        'api/*',
        'sanctum/csrf-cookie',
        
        // Webhook untuk payment gateway (jika ada)
        'webhook/midtrans',
        'webhook/xendit',
    ];
}