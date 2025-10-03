<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class MenuController extends Controller
{
    public function index(Request $request)
    {
        $category = $request->query('category');
        $search = $request->query('search');
        $penjual_id = $request->query('penjual_id');
        
        $menus = Menu::with(['penjual' => function($query) {
            $query->select('id', 'name', 'kantin_name', 'location', 'avatar');
        }])
        ->where('is_available', true)
        ->when($category && $category !== 'all', function($query) use ($category) {
            return $query->where('category', $category);
        })
        ->when($search, function($query) use ($search) {
            return $query->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
        })
        ->when($penjual_id, function($query) use ($penjual_id) {
            return $query->where('penjual_id', $penjual_id);
        })
        ->orderBy('is_popular', 'desc')
        ->orderBy('rating', 'desc')
        ->orderBy('created_at', 'desc')
        ->paginate(12);

        return response()->json([
            'success' => true,
            'data' => $menus
        ]);
    }

public function penjualMenus(Request $request)
{
    logger('=== penjualMenus METHOD CALLED ===', [
        'user_id' => $request->user()->id,
        'user_name' => $request->user()->name,
        'user_role' => $request->user()->role,
        'is_approved' => $request->user()->is_approved
    ]);

    try {
        $menus = $request->user()->menus()
            ->orderBy('created_at', 'desc')
            ->get();

        logger('Menus loaded successfully', [
            'count' => $menus->count(),
            'menu_ids' => $menus->pluck('id')
        ]);

        // Pastikan response structure konsisten
        return response()->json([
            'success' => true,
            'data' => $menus,
            'message' => 'Menus retrieved successfully'
        ]);

    } catch (\Exception $e) {
        logger('Error in penjualMenus: ' . $e->getMessage());
        
        return response()->json([
            'success' => false,
            'message' => 'Failed to load menus',
            'error' => $e->getMessage()
        ], 500);
    }
}

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'price' => 'required|numeric|min:0',
            'prep_time' => 'required|integer|min:1',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_available' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Handle image upload
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('menu-images', 'public');
        }

        $menu = $request->user()->menus()->create([
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'prep_time' => $request->prep_time,
            'image' => $imagePath,
            'is_available' => $request->boolean('is_available', true),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Menu berhasil ditambahkan',
            'data' => $menu->load('penjual')
        ], 201);
    }

    public function show($id)
    {
        $menu = Menu::with(['penjual' => function($query) {
            $query->select('id', 'name', 'kantin_name', 'location', 'avatar');
        }])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $menu
        ]);
    }

    public function update(Request $request, $id)
    {
        $menu = $request->user()->menus()->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'price' => 'required|numeric|min:0',
            'category' => 'sometimes|string|max:255',
            'prep_time' => 'required|integer|min:1',
            'is_available' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Handle image upload if new image provided
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($menu->image) {
                Storage::disk('public')->delete($menu->image);
            }
            $imagePath = $request->file('image')->store('menu-images', 'public');
            $menu->image = $imagePath;
        }

        $menu->update([
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'category' => $request->category,
            'prep_time' => $request->prep_time,
            'is_available' => $request->boolean('is_available', $menu->is_available),
            'image' => $menu->image, // Keep existing image if not updated
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Menu berhasil diupdate',
            'data' => $menu->load('penjual')
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $menu = $request->user()->menus()->findOrFail($id);

        // Delete associated image
        if ($menu->image) {
            Storage::disk('public')->delete($menu->image);
        }

        $menu->delete();

        return response()->json([
            'success' => true,
            'message' => 'Menu berhasil dihapus'
        ]);
    }

    public function toggleAvailability(Request $request, $id)
    {
        $menu = $request->user()->menus()->findOrFail($id);

        $menu->update([
            'is_available' => !$menu->is_available
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status ketersediaan menu berhasil diupdate',
            'data' => $menu
        ]);
    }

    public function categories()
    {
        $categories = Menu::where('is_available', true)
            ->distinct()
            ->pluck('category')
            ->map(function($category) {
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

    public function popularMenus()
    {
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

    public function search(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|string|min:2'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Query pencarian harus minimal 2 karakter',
                'errors' => $validator->errors()
            ], 422);
        }

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

    private function getCategoryName($category)
    {
        $categoryNames = [
            'main' => 'Makanan Utama',
            'snack' => 'Snack',
            'drink' => 'Minuman',
            'dessert' => 'Dessert'
        ];

        return $categoryNames[$category] ?? $category;
    }
}