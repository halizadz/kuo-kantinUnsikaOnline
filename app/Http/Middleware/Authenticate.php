<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        // Untuk API, return null (tidak redirect, tapi return JSON error)
        if ($request->expectsJson()) {
            return null;
        }
        
        // Untuk web routes, redirect ke login page
        return route('login');
    }
}