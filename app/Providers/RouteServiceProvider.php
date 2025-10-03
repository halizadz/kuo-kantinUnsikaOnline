<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * The path to your application's "home" route.
     *
     * Typically, users are redirected here after authentication.
     *
     * @var string
     */
    public const HOME = '/dashboard'; // Ini adalah URL, bukan path file. '/dashboard' sudah benar.

    /**
     * Define your route model bindings, pattern filters, and other route configuration.
     */
    public function boot(): void
    {
        // Configure rate limiting for API routes
        $this->configureRateLimiting();
        
        // Note: In Laravel 11, routes are registered in bootstrap/app.php
        // No need to manually register routes here
    }

    /**
     * Configure the rate limiters for the application.
     *
     * Ini adalah method yang hilang atau salah dan menyebabkan error.
     * Method ini mendefinisikan rate limiter bernama 'api'.
     *
     * @return void
     */
    protected function configureRateLimiting()
    {
        RateLimiter::for('api', function (Request $request) {
            // Izinkan 60 request per menit per user (jika sudah login) atau per alamat IP (jika belum login)
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });
    }
}