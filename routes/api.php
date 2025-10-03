<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\PenjualController;
use App\Http\Controllers\OrderController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::get('/test', function () {
    return response()->json([
        'success' => true,
        'message' => 'API KantinKampus is working!',
        'timestamp' => now()
    ]);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/menus', [MenuController::class, 'index']);
Route::get('/menus/{id}', [MenuController::class, 'show']);

Route::get('/penjual', [PenjualController::class, 'getAllPenjual']);
Route::get('/penjual/{id}', [PenjualController::class, 'getPenjualDetail'])->where('id', '[0-9]+');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // MAHASISWA
    Route::middleware('mahasiswa')->group(function () {
        Route::post('/orders', [OrderController::class, 'store']);
        Route::get('/user/orders', [OrderController::class, 'userOrders']);
        Route::get('/orders/{id}', [OrderController::class, 'show']);
    });

    // PENJUAL - PERHATIKAN: TIDAK ADA auth:sanctum LAGI KARENA SUDAH DI PARENT
    Route::middleware('penjual')->group(function () {
        Route::get('/penjual/profile', [PenjualController::class, 'profile']);
        Route::put('/penjual/profile', [PenjualController::class, 'updateProfile']);
        Route::get('/penjual/stats', [PenjualController::class, 'getPenjualStats']);
        Route::get('/penjual/menus', [MenuController::class, 'penjualMenus']);
        Route::get('/penjual/orders', [OrderController::class, 'penjualOrders']);
        
        Route::middleware('penjual.approved')->group(function () {
            Route::post('/penjual/menus', [MenuController::class, 'store']);
            Route::post('/penjual/menus/{id}', [MenuController::class, 'update']);
            Route::delete('/penjual/menus/{id}', [MenuController::class, 'destroy']);
            Route::patch('/penjual/menus/{id}/toggle-availability', [MenuController::class, 'toggleAvailability']);
            Route::put('/penjual/orders/{id}/status', [OrderController::class, 'updateStatus']);
        });
    });

    // ADMIN
    Route::middleware('admin')->group(function () {
        Route::get('/admin/users', [AdminController::class, 'getUsers']);
        Route::get('/admin/users/{id}', [AdminController::class, 'getUserDetail']);
        Route::post('/admin/users/{id}/toggle-status', [AdminController::class, 'toggleUserStatus']);
        Route::get('/admin/penjual/pending', [AdminController::class, 'getPendingPenjual']);
        Route::post('/admin/penjual/{id}/approve', [AdminController::class, 'approvePenjual']);
        Route::delete('/admin/penjual/{id}/reject', [AdminController::class, 'rejectPenjual']);
        Route::get('/admin/stats', [AdminController::class, 'getStats']);
    });
});