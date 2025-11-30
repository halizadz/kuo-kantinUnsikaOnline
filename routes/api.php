<?php

/**
 * ============================================================================
 * API ROUTES CONFIGURATION
 * ============================================================================
 * File ini berisi semua route API untuk aplikasi KantinKampus
 * Menggunakan Laravel Sanctum untuk autentikasi
 */

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\PenjualController;
use App\Http\Controllers\OrderController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

/**
 * ============================================================================
 * PUBLIC ROUTES (Tidak memerlukan autentikasi)
 * ============================================================================
 */

// Test endpoint untuk memastikan API berjalan
Route::get('/test', function () {
    return response()->json([
        'success' => true,
        'message' => 'API KantinKampus is working!',
        'timestamp' => now()
    ]);
});

// Authentication Routes
Route::post('/register', [AuthController::class, 'register']); // Registrasi user baru
Route::post('/login', [AuthController::class, 'login']); // Login user

// Public Menu & Penjual Routes (dapat diakses tanpa login)
Route::get('/menus', [MenuController::class, 'index']); // List semua menu
Route::get('/menus/{id}', [MenuController::class, 'show']); // Detail menu specific
Route::get('/penjual', [PenjualController::class, 'getAllPenjual']); // List semua penjual
Route::get('/penjual/{id}', [PenjualController::class, 'getPenjualDetail'])->where('id', '[0-9]+'); // Detail penjual

/**
 * ============================================================================
 * PROTECTED ROUTES (Memerlukan autentikasi Sanctum)
 * ============================================================================
 */
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth Routes
    Route::post('/logout', [AuthController::class, 'logout']); // Logout user
    Route::get('/me', [AuthController::class, 'me']); // Get current user data

    /**
     * ------------------------------------------------------------------------
     * MAHASISWA ROUTES
     * ------------------------------------------------------------------------
     * Routes yang hanya bisa diakses oleh user dengan role 'mahasiswa'
     */
    Route::middleware('mahasiswa')->group(function () {
        // Order Management
        Route::post('/orders', [OrderController::class, 'store']); // Buat pesanan baru
        Route::get('/user/orders', [OrderController::class, 'userOrders']); // List pesanan user
        Route::get('/orders/{id}', [OrderController::class, 'show']); // Detail pesanan
        
        // Order Actions
        Route::post('/orders/{order}/rating', [OrderController::class, 'submitRating']); // Submit rating pesanan
        Route::post('/orders/{order}/cancel', [OrderController::class, 'cancelOrder']); // Cancel pesanan
        Route::post('/orders/{order}/confirm-pickup', [OrderController::class, 'confirmPickup']); // Konfirmasi ambil pesanan
    });

    /**
     * ------------------------------------------------------------------------
     * PENJUAL ROUTES
     * ------------------------------------------------------------------------
     * Routes yang hanya bisa diakses oleh user dengan role 'penjual'
     */
    Route::middleware('penjual')->group(function () {
        // Profile Management
        Route::get('/penjual/profile', [PenjualController::class, 'profile']); // Get profile penjual
        Route::put('/penjual/profile', [PenjualController::class, 'updateProfile']); // Update profile
        
        // Statistics
        Route::get('/penjual/stats', [PenjualController::class, 'getPenjualStats']); // Get statistik penjual
        
        // Menu & Order Management (read-only)
        Route::get('/penjual/menus', [MenuController::class, 'penjualMenus']); // List menu penjual
        Route::get('/penjual/orders', [OrderController::class, 'penjualOrders']); // List pesanan penjual
        Route::get('/penjual/ratings', [PenjualController::class, 'getRatings']); // List rating penjual
        
        /**
         * APPROVED PENJUAL ROUTES
         * Routes yang hanya bisa diakses setelah penjual di-approve admin
         */
        Route::middleware('penjual.approved')->group(function () {
            // Menu Management (CRUD)
            Route::post('/penjual/menus', [MenuController::class, 'store']); // Tambah menu baru
            Route::post('/penjual/menus/{id}', [MenuController::class, 'update']); // Update menu
            Route::delete('/penjual/menus/{id}', [MenuController::class, 'destroy']); // Hapus menu
            Route::patch('/penjual/menus/{id}/toggle-availability', [MenuController::class, 'toggleAvailability']); // Toggle ketersediaan menu
            
            // Order Status Management
            Route::put('/penjual/orders/{id}/status', [OrderController::class, 'updateStatus']); // Update status pesanan
            
            // Export Data
            Route::get('/penjual/export/menus', [PenjualController::class, 'exportMenus']); // Export menu ke Excel
            Route::get('/penjual/export/orders', [PenjualController::class, 'exportOrders']); // Export orders ke Excel
            Route::get('/penjual/export/ratings', [PenjualController::class, 'exportRatings']); // Export ratings ke Excel
        });
    });

    /**
     * ------------------------------------------------------------------------
     * ADMIN ROUTES
     * ------------------------------------------------------------------------
     * Routes yang hanya bisa diakses oleh user dengan role 'admin'
     */
    Route::middleware('admin')->group(function () {
        // User Management
        Route::get('/admin/users', [AdminController::class, 'getUsers']); // List semua users
        Route::get('/admin/users/{id}', [AdminController::class, 'getUserDetail']); // Detail user
        Route::put('/admin/users/{id}', [AdminController::class, 'updateUser']); // Update user
        Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']); // Hapus user
        Route::post('/admin/users/{id}/toggle-status', [AdminController::class, 'toggleUserStatus']); // Toggle status aktif user
        
        // Penjual Approval Management
        Route::get('/admin/penjual/pending', [AdminController::class, 'getPendingPenjual']); // List penjual pending approval
        Route::post('/admin/penjual/{id}/approve', [AdminController::class, 'approvePenjual']); // Approve penjual
        Route::delete('/admin/penjual/{id}/reject', [AdminController::class, 'rejectPenjual']); // Reject penjual
        
        // Statistics & Monitoring
        Route::get('/admin/stats', [AdminController::class, 'getStats']); // Get statistik sistem
        Route::get('/admin/ratings', [AdminController::class, 'getAllRatings']); // List semua rating
        
        // Export Data
        Route::get('/admin/export/users', [AdminController::class, 'exportUsers']); // Export users ke Excel
        Route::get('/admin/export/orders', [AdminController::class, 'exportOrders']); // Export orders ke Excel
        Route::get('/admin/export/menus', [AdminController::class, 'exportMenus']); // Export menus ke Excel
        Route::get('/admin/export/ratings', [AdminController::class, 'exportRatings']); // Export ratings ke Excel
    });
});