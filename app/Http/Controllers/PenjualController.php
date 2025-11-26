<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Rating;

class PenjualController extends Controller
{
    /**
     * Mengambil profil dan statistik dasar penjual yang sedang login.
     */
    public function profile(Request $request)
    {
        $user = $request->user()->load('menus');

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
            ]
        ]);
    }

    /**
     * Mengupdate profil kantin penjual.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'kantin_name' => 'sometimes|string|max:255',
            'location' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:15',
            'description' => 'sometimes|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update($request->only(['kantin_name', 'location', 'phone', 'description']));

        return response()->json([
            'success' => true,
            'message' => 'Profil kantin berhasil diupdate',
            'data' => $user
        ]);
    }

    /**
     * Mengambil statistik detail untuk dashboard penjual.
     */
    public function getPenjualStats(Request $request)
    {
        $user = $request->user();

        $stats = [
            'total_menus' => $user->menus()->count(),
            'active_menus' => $user->menus()->where('is_available', true)->count(),
            'inactive_menus' => $user->menus()->where('is_available', false)->count(),
            'average_rating' => round($user->menus()->avg('rating') ?? 0, 1),
            'popular_menus' => $user->menus()->where('is_popular', true)->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Mengambil semua data penjual untuk ditampilkan ke pembeli.
     */
    public function getAllPenjual(Request $request)
    {
        $penjual = User::where('role', 'penjual')
            ->where('is_approved', true)
            ->withCount('menus')
            ->orderBy('kantin_name')
            ->get(['id', 'name', 'kantin_name', 'location', 'avatar']);

        return response()->json([
            'success' => true,
            'data' => [
                'data' => $penjual
            ]
        ]);
    }

    /**
     * Mengambil detail satu penjual beserta menu yang tersedia.
     */
    public function getPenjualDetail($id)
    {
        $penjual = User::approvedPenjual()
            ->with(['menus' => function($query) {
                $query->where('is_available', true)
                      ->orderBy('is_popular', 'desc')
                      ->orderBy('rating', 'desc');
            }])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $penjual
        ]);
    }

    // TAMBAHAN: Method untuk get ratings penjual
public function getRatings(Request $request)
{
    $penjual = $request->user();

    $ratings = Rating::with(['user:id,name', 'menu:id,name', 'order:id,order_number'])
        ->where('penjual_id', $penjual->id)
        ->orderBy('created_at', 'desc')
        ->get();

    return response()->json([
        'success' => true,
        'data' => $ratings
    ]);
}
}