<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Rating;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\MenusExport;
use App\Exports\OrdersExport;
use App\Exports\RatingsExport;

/**
 * Class PenjualController
 * 
 * Controller untuk mengelola fungsi-fungsi penjual:
 * - Profile management
 * - Statistik dashboard
 * - Ratings management
 * - Export data
 * - Public endpoints untuk pembeli melihat daftar penjual
 */
class PenjualController extends Controller
{
    /**
     * Mengambil profil dan data dasar penjual yang sedang login
     */
    public function profile(Request $request)
    {
        // Ambil user dengan relasi menus
        $user = $request->user()->load('menus');

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
            ]
        ]);
    }

    /**
     * Update profil kantin penjual
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        // Validasi input (semua field opsional dengan 'sometimes')
        $validator = Validator::make($request->all(), [
            'kantin_name' => 'sometimes|string|max:255',
            'location' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:15',
            'description' => 'sometimes|string|max:500',
        ]);

        // Return error jika validasi gagal
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update hanya field yang ada dalam request
        $user->update($request->only(['kantin_name', 'location', 'phone', 'description']));

        return response()->json([
            'success' => true,
            'message' => 'Profil kantin berhasil diupdate',
            'data' => $user
        ]);
    }

    /**
     * Mengambil statistik detail untuk dashboard penjual
     */
    public function getPenjualStats(Request $request)
    {
        $user = $request->user();

        // Hitung berbagai statistik menu
        $stats = [
            'total_menus' => $user->menus()->count(), // Total semua menu
            'active_menus' => $user->menus()->where('is_available', true)->count(), // Menu yang tersedia
            'inactive_menus' => $user->menus()->where('is_available', false)->count(), // Menu yang habis
            'average_rating' => round($user->menus()->avg('rating') ?? 0, 1), // Rating rata-rata semua menu
            'popular_menus' => $user->menus()->where('is_popular', true)->count(), // Menu yang populer
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Mengambil semua data penjual untuk ditampilkan ke pembeli
     * Endpoint publik
     */
    public function getAllPenjual(Request $request)
    {
        // Ambil semua penjual yang sudah approved dan tidak dihapus
        $penjual = User::where('role', 'penjual')
            ->where('is_approved', true)
            ->whereNull('deleted_at') // Tidak termasuk yang soft deleted
            ->withCount('menus') // Hitung jumlah menu per penjual
            ->orderBy('kantin_name') // Urutkan berdasarkan nama kantin
            ->get(['id', 'name', 'kantin_name', 'location', 'avatar']); // Hanya ambil field yang dibutuhkan

        return response()->json([
            'success' => true,
            'data' => [
                'data' => $penjual
            ]
        ]);
    }

    /**
     * Mengambil detail satu penjual beserta menu yang tersedia
     * Endpoint publik
     */
    public function getPenjualDetail($id)
    {
        // Cari penjual yang approved dan tidak dihapus
        $penjual = User::approvedPenjual()
            ->whereNull('deleted_at')
            ->with(['menus' => function($query) {
                // Hanya ambil menu yang tersedia
                $query->where('is_available', true)
                      ->orderBy('is_popular', 'desc') // Menu populer dulu
                      ->orderBy('rating', 'desc');    // Lalu rating tertinggi
            }])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $penjual
        ]);
    }

    /**
     * Mengambil semua ratings untuk penjual yang sedang login
     */
    public function getRatings(Request $request)
    {
        $penjual = $request->user();

        // Ambil semua rating untuk penjual ini dengan relasi
        $ratings = Rating::with(['user:id,name', 'menu:id,name', 'order:id,order_number'])
            ->where('penjual_id', $penjual->id)
            ->orderBy('created_at', 'desc') // Terbaru dulu
            ->get();

        return response()->json([
            'success' => true,
            'data' => $ratings
        ]);
    }

    /**
     * Export menus penjual ke Excel
     */
    public function exportMenus(Request $request)
    {
        $user = $request->user();
        
        // Generate filename dengan nama kantin dan timestamp
        $filename = 'menus_' . $user->kantin_name . '_' . date('Y-m-d_His') . '.xlsx';
        
        // Download Excel dengan filter penjual_id
        return Excel::download(
            new MenusExport($user->id), 
            $filename
        );
    }

    /**
     * Export orders penjual ke Excel
     */
    public function exportOrders(Request $request)
    {
        $user = $request->user();
        // Ambil parameter filter dari query string
        $status = $request->query('status');
        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');
        
        // Generate filename dengan nama kantin dan timestamp
        $filename = 'orders_' . $user->kantin_name . '_' . date('Y-m-d_His') . '.xlsx';
        
        // Download Excel dengan filter
        return Excel::download(
            new OrdersExport($status, $user->id, $dateFrom, $dateTo), 
            $filename
        );
    }

    /**
     * Export ratings penjual ke Excel
     */
    public function exportRatings(Request $request)
    {
        $user = $request->user();
        // Ambil parameter filter dari query string
        $minRating = $request->query('min_rating');
        
        // Generate filename dengan nama kantin dan timestamp
        $filename = 'ratings_' . $user->kantin_name . '_' . date('Y-m-d_His') . '.xlsx';
        
        // Download Excel dengan filter
        return Excel::download(
            new RatingsExport($user->id, $minRating), 
            $filename
        );
    }
}