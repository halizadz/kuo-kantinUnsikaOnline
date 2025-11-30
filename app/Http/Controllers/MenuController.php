<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

/**
 * Class MenuController
 * 
 * Controller untuk mengelola menu makanan/minuman:
 * - CRUD menu
 * - Filtering dan pencarian
 * - Toggle ketersediaan
 * - Menu populer
 */
class MenuController extends Controller
{
    /**
     * Mengambil daftar menu dengan filter dan pagination
     * Endpoint publik untuk pembeli melihat menu
     */
    public function index(Request $request)
    {
        // Ambil parameter filter dari query string
        $category = $request->query('category');
        $search = $request->query('search');
        $penjual_id = $request->query('penjual_id');
        
        // Query menu dengan eager loading relasi penjual
        $menus = Menu::with(['penjual' => function($query) {
            // Hanya ambil field yang dibutuhkan untuk efisiensi
            $query->select('id', 'name', 'kantin_name', 'location', 'avatar');
        }])
        ->where('is_available', true) // Hanya tampilkan menu yang tersedia
        ->when($category && $category !== 'all', function($query) use ($category) {
            // Filter berdasarkan kategori jika ada
            return $query->where('category', $category);
        })
        ->when($search, function($query) use ($search) {
            // Filter berdasarkan pencarian di nama atau deskripsi
            return $query->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
        })
        ->when($penjual_id, function($query) use ($penjual_id) {
            // Filter berdasarkan penjual tertentu
            return $query->where('penjual_id', $penjual_id);
        })
        ->orderBy('is_popular', 'desc') // Menu populer di atas
        ->orderBy('rating', 'desc')     // Lalu urutkan berdasarkan rating
        ->orderBy('created_at', 'desc') // Terakhir menu terbaru
        ->paginate(12); // 12 menu per halaman

        return response()->json([
            'success' => true,
            'data' => $menus
        ]);
    }

    /**
     * Mengambil menu milik penjual yang sedang login
     * Endpoint khusus untuk penjual mengelola menu mereka
     */
    public function penjualMenus(Request $request)
    {
        // Log untuk debugging
        logger('=== penjualMenus METHOD CALLED ===', [
            'user_id' => $request->user()->id,
            'user_name' => $request->user()->name,
            'user_role' => $request->user()->role,
            'is_approved' => $request->user()->is_approved
        ]);

        try {
            // Ambil semua menu milik penjual yang login
            $menus = $request->user()->menus()
                ->orderBy('created_at', 'desc')
                ->get();

            logger('Menus loaded successfully', [
                'count' => $menus->count(),
                'menu_ids' => $menus->pluck('id')
            ]);

            // Return response dengan struktur konsisten
            return response()->json([
                'success' => true,
                'data' => $menus,
                'message' => 'Menus retrieved successfully'
            ]);

        } catch (\Exception $e) {
            // Log error untuk debugging
            logger('Error in penjualMenus: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to load menus',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Membuat menu baru
     * Hanya bisa diakses oleh penjual
     */
    public function store(Request $request)
    {
        // Validasi input
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'price' => 'required|numeric|min:0', // Harga tidak boleh negatif
            'prep_time' => 'required|integer|min:1', // Waktu persiapan minimal 1 menit
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Max 2MB
            'is_available' => 'boolean'
        ]);

        // Return error jika validasi gagal
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Handle upload gambar menu
        $imagePath = null;
        if ($request->hasFile('image')) {
            // Simpan gambar ke storage/app/public/menu-images
            $imagePath = $request->file('image')->store('menu-images', 'public');
        }

        // Buat menu baru untuk penjual yang login
        $menu = $request->user()->menus()->create([
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'prep_time' => $request->prep_time,
            'image' => $imagePath,
            'is_available' => $request->boolean('is_available', true), // Default true
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Menu berhasil ditambahkan',
            'data' => $menu->load('penjual') // Load relasi penjual
        ], 201);
    }

    /**
     * Mengambil detail satu menu
     */
    public function show($id)
    {
        // Cari menu dengan relasi penjual
        $menu = Menu::with(['penjual' => function($query) {
            $query->select('id', 'name', 'kantin_name', 'location', 'avatar');
        }])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $menu
        ]);
    }

    /**
     * Update menu
     * Hanya pemilik menu yang bisa update
     */
    public function update(Request $request, $id)
    {
        // Cari menu milik penjual yang login
        $menu = $request->user()->menus()->findOrFail($id);

        // Validasi input
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'price' => 'required|numeric|min:0',
            'category' => 'sometimes|string|max:255',
            'prep_time' => 'required|integer|min:1',
            'is_available' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Return error jika validasi gagal
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Handle upload gambar baru jika ada
        if ($request->hasFile('image')) {
            // Hapus gambar lama jika ada
            if ($menu->image) {
                Storage::disk('public')->delete($menu->image);
            }
            // Upload gambar baru
            $imagePath = $request->file('image')->store('menu-images', 'public');
            $menu->image = $imagePath;
        }

        // Update data menu
        $menu->update([
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'category' => $request->category,
            'prep_time' => $request->prep_time,
            'is_available' => $request->boolean('is_available', $menu->is_available),
            'image' => $menu->image, // Gunakan gambar yang ada jika tidak diupdate
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Menu berhasil diupdate',
            'data' => $menu->load('penjual')
        ]);
    }

    /**
     * Hapus menu
     * Hanya pemilik menu yang bisa hapus
     */
    public function destroy(Request $request, $id)
    {
        // Cari menu milik penjual yang login
        $menu = $request->user()->menus()->findOrFail($id);

        // Hapus gambar dari storage jika ada
        if ($menu->image) {
            Storage::disk('public')->delete($menu->image);
        }

        // Hapus menu dari database
        $menu->delete();

        return response()->json([
            'success' => true,
            'message' => 'Menu berhasil dihapus'
        ]);
    }

    /**
     * Toggle ketersediaan menu (tersedia/habis)
     */
    public function toggleAvailability(Request $request, $id)
    {
        // Cari menu milik penjual yang login
        $menu = $request->user()->menus()->findOrFail($id);

        // Toggle status ketersediaan
        $menu->update([
            'is_available' => !$menu->is_available
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status ketersediaan menu berhasil diupdate',
            'data' => $menu
        ]);
    }

    /**
     * Mengambil daftar kategori menu yang tersedia
     */
    public function categories()
    {
        // Ambil kategori unik dari menu yang tersedia
        $categories = Menu::where('is_available', true)
            ->distinct()
            ->pluck('category')
            ->map(function($category) {
                // Format sebagai object dengan ID dan nama
                return [
                    'id' => $category,
                    'name' => $this->getCategoryName($category)
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * Mengambil menu-menu populer
     */
    public function popularMenus()
    {
        // Ambil 8 menu populer dengan rating tertinggi
        $menus = Menu::with(['penjual' => function($query) {
            $query->select('id', 'name', 'kantin_name', 'location');
        }])
        ->where('is_available', true)
        ->where('is_popular', true)
        ->orderBy('rating', 'desc')
        ->limit(8)
        ->get();

        return response()->json([
            'success' => true,
            'data' => $menus
        ]);
    }

    /**
     * Pencarian menu
     */
    public function search(Request $request)
    {
        // Validasi query pencarian
        $validator = Validator::make($request->all(), [
            'query' => 'required|string|min:2' // Minimal 2 karakter
        ]);

        // Return error jika validasi gagal
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Query pencarian harus minimal 2 karakter',
                'errors' => $validator->errors()
            ], 422);
        }

        // Cari menu berdasarkan nama, deskripsi, atau kategori
        $menus = Menu::with(['penjual' => function($query) {
            $query->select('id', 'name', 'kantin_name', 'location');
        }])
        ->where('is_available', true)
        ->where(function($query) use ($request) {
            $query->where('name', 'like', "%{$request->query}%")
                  ->orWhere('description', 'like', "%{$request->query}%")
                  ->orWhere('category', 'like', "%{$request->query}%");
        })
        ->orderBy('rating', 'desc')
        ->paginate(12);

        return response()->json([
            'success' => true,
            'data' => $menus
        ]);
    }

    /**
     * Helper method untuk mendapatkan nama kategori dalam Bahasa Indonesia
     */
    private function getCategoryName($category)
    {
        $categoryNames = [
            'main' => 'Makanan Utama',
            'snack' => 'Snack',
            'drink' => 'Minuman',
            'dessert' => 'Dessert'
        ];

        // Return nama Indonesia atau nilai asli jika tidak ada mapping
        return $categoryNames[$category] ?? $category;
    }
}