<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
    web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        apiPrefix: 'api',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
           // Exclude API routes from CSRF validation
     // Exclude API routes from CSRF validation
        $middleware->validateCsrfTokens(except: [
            'api/*',
        ]);
        // Register custom middleware aliases
        $middleware->alias([
            'auth' => App\Http\Middleware\Authenticate::class,
    'penjual' => App\Http\Middleware\CheckPenjual::class,
            'penjual.approved' => App\Http\Middleware\CheckPenjualApproved::class,
            'mahasiswa' => App\Http\Middleware\CheckMahasiswa::class,
            'admin' => App\Http\Middleware\CheckAdmin::class,
        ]);

     
    })
    
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();