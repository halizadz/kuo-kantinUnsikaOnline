<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

/**
 * Class AppServiceProvider
 * 
 * Service Provider utama aplikasi Laravel.
 * Service Provider adalah tempat untuk mendaftarkan service/component
 * dan melakukan konfigurasi aplikasi saat bootstrap.
 * 
 * AppServiceProvider adalah provider yang pertama kali dijalankan.
 * Digunakan untuk:
 * - Binding service ke container
 * - Konfigurasi aplikasi
 * - Mendaftarkan macros
 * - Setup rate limiting
 */
class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services
     */
    public function register(): void
    {

    }

    /**
     * Bootstrap any application services
     * 
     * Method ini dipanggil setelah semua provider di-register.
     */
    public function boot(): void
    {
        // Konfigurasi rate limiting untuk API
        
        RateLimiter::for('api', function (Request $request) {
            // Batasi 60 request per menit
            // Limit berbeda untuk setiap user (jika login) atau IP (jika guest)
            
            // $request->user()?->id : ID user jika login
            // $request->ip()        : IP address jika guest
            
            // Jika user login, rate limit per user
            // Jika user belum login, rate limit per IP address
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });
        
    }
}