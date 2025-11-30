<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Menu;
use App\Models\Rating;

/**
 * Class OrderController
 * 
 * Controller untuk mengelola pesanan:
 * - Membuat pesanan baru
 * - Melihat daftar pesanan
 * - Update status pesanan
 * - Submit rating
 * - Cancel pesanan
 */
class OrderController extends Controller
{
    /**
     * Membuat pesanan baru
     * Satu order bisa berisi menu dari berbagai penjual,
     * dan akan dipecah menjadi order terpisah per penjual
     */
    public function store(Request $request)
    {
        // Validasi input pesanan
        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1', // Minimal 1 item
            'items.*.menu_id' => 'required|integer|exists:menus,id', // Menu harus ada
            'items.*.quantity' => 'required|integer|min:1', // Quantity minimal 1
            'delivery_option' => 'required|string|in:pickup,delivery', // Hanya pickup atau delivery
            'delivery_address' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Validasi tambahan: delivery harus ada alamat
        $validator->after(function ($validator) use ($request) {
            if ($request->delivery_option === 'delivery' && empty($request->delivery_address)) {
                $validator->errors()->add('delivery_address', 'Alamat pengantaran wajib diisi untuk opsi delivery');
            }
        });

        // Return error jika validasi gagal
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Data pesanan tidak valid',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $cartItems = $request->items;

        // Ambil data menu untuk semua item dalam cart
        $menuIds = array_column($cartItems, 'menu_id');
        $menus = Menu::find($menuIds)->keyBy('id');

        // Kelompokkan items berdasarkan penjual
        $ordersByPenjual = [];
        foreach ($cartItems as $item) {
            $menu = $menus->get($item['menu_id']);
            if ($menu) {
                // Cek ketersediaan menu
                if (!$menu->is_available) {
                    return response()->json([
                        'success' => false,
                        'message' => "Menu '{$menu->name}' sedang tidak tersedia."
                    ], 400);
                }
                // Kelompokkan item berdasarkan penjual_id
                $penjualId = $menu->penjual_id;
                $ordersByPenjual[$penjualId][] = [
                    'menu' => $menu,
                    'quantity' => $item['quantity']
                ];
            }
        }
        
        $createdOrders = [];

        // Gunakan database transaction untuk memastikan atomicity
        DB::beginTransaction();
        try {
            // Buat order terpisah untuk setiap penjual
            foreach ($ordersByPenjual as $penjualId => $items) {
                // Hitung total harga order ini
                $totalPrice = array_reduce($items, function ($sum, $item) {
                    return $sum + ($item['menu']->price * $item['quantity']);
                }, 0);

                // Hitung waktu persiapan maksimal
                $maxPrepTime = array_reduce($items, function ($max, $item) {
                    return max($max, $item['menu']->prep_time);
                }, 0);

                // Estimasi waktu selesai (prep time + 10 menit jika delivery)
                $estimatedTime = now()->addMinutes($maxPrepTime + ($request->delivery_option === 'delivery' ? 10 : 0));

                // Buat order baru
                $order = Order::create([
                    'user_id' => $user->id,
                    'penjual_id' => $penjualId,
                    'order_number' => 'ORD-' . strtoupper(uniqid()), // Generate nomor order unik
                    'total_price' => $totalPrice,
                    'status' => 'pending', // Status awal pending
                    'delivery_option' => $request->delivery_option,
                    'delivery_address' => $request->delivery_address,
                    'notes' => $request->notes,
                    'estimated_time' => $estimatedTime,
                ]);

                // Siapkan data order items
                $orderItemsData = [];
                foreach ($items as $item) {
                    $orderItemsData[] = [
                        'order_id' => $order->id,
                        'menu_id' => $item['menu']->id,
                        'quantity' => $item['quantity'],
                        'price' => $item['menu']->price, // Simpan harga saat order dibuat
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
                // Insert semua order items sekaligus (lebih efisien)
                OrderItem::insert($orderItemsData);
                
                // Load relasi untuk response
                $createdOrders[] = $order->load('orderItems.menu', 'penjual');
            }

            // Commit transaction jika semua berhasil
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pesanan berhasil dibuat!',
                'data' => $createdOrders
            ], 201);

        } catch (\Exception $e) {
            // Rollback jika ada error
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat pesanan, terjadi kesalahan server.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mengambil daftar order untuk penjual
     */
    public function penjualOrders(Request $request)
    {
        $penjual = $request->user();

        // Ambil semua order untuk penjual ini dengan pagination
        $orders = Order::where('penjual_id', $penjual->id)
                        ->with(['user:id,name,phone', 'orderItems.menu:id,name,image'])
                        ->latest() // Urutkan terbaru dulu
                        ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Update status order oleh penjual
     */
    public function updateStatus(Request $request, $id)
    {
        $penjual = $request->user();

        // Validasi status yang diinginkan
        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:processing,ready,on_delivery,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Cari order
        $order = Order::find($id);

        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Pesanan tidak ditemukan'], 404);
        }

        // Cek kepemilikan order
        if ($order->penjual_id !== $penjual->id) {
            return response()->json(['success' => false, 'message' => 'Anda tidak memiliki akses ke pesanan ini'], 403);
        }

        // Logic khusus: jika status ready dan delivery, otomatis jadi on_delivery
        if ($request->status === 'ready' && $order->isDelivery()) {
            $order->status = 'on_delivery';
        } else {
            $order->status = $request->status;
        }

        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Status pesanan berhasil diperbarui',
            'data' => $order->load('user', 'orderItems.menu')
        ]);
    }

    /**
     * Mengambil daftar order untuk user/pembeli
     */
    public function userOrders(Request $request)
    {
        $user = $request->user();

        // Ambil semua order user dengan pagination
        $orders = Order::where('user_id', $user->id)
                        ->with(['penjual:id,kantin_name,location', 'orderItems.menu:id,name,image'])
                        ->latest()
                        ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Mengambil detail satu order
     */
    public function show($id)
    {
        // Ambil order dengan semua relasi yang dibutuhkan
        $order = Order::with([
            'user:id,name,phone',
            'penjual:id,kantin_name,location,phone',
            'orderItems.menu:id,name,image'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    /**
     * Submit rating untuk order yang sudah selesai
     */
    public function submitRating(Order $order, Request $request)
    {
        // Validasi input rating
        $request->validate([
            'rating' => 'required|numeric|min:1|max:5', // Rating 1-5
            'review' => 'nullable|string|max:1000'
        ]);

        // Cek kepemilikan order
        if ($order->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Cek status order
        if ($order->status !== 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya pesanan yang sudah selesai yang bisa diberi rating'
            ], 400);
        }

        // Cek apakah sudah pernah diberi rating
        if ($order->is_rated) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan ini sudah diberi rating'
            ], 400);
        }

        // Gunakan transaction untuk memastikan semua operasi berhasil
        DB::transaction(function () use ($order, $request) {
            // Buat rating untuk setiap menu item dalam order
            foreach ($order->orderItems as $item) {
                Rating::create([
                    'order_id' => $order->id,
                    'user_id' => auth()->id(),
                    'penjual_id' => $order->penjual_id,
                    'menu_id' => $item->menu_id,
                    'rating' => $request->rating,
                    'review' => $request->review
                ]);

                // Tandai order item sudah diberi rating
                $item->update(['is_rated' => true]);
            }

            // Tandai order sudah diberi rating
            $order->update([
                'is_rated' => true,
                'average_rating' => $request->rating
            ]);

            // Update rating rata-rata menu
            $this->updateMenuRating($order);
        });

        return response()->json([
            'success' => true,
            'message' => 'Rating berhasil disimpan'
        ]);
    }

    /**
     * Update rating rata-rata menu berdasarkan semua rating yang ada
     */
    private function updateMenuRating($order)
    {
        // Loop setiap item dalam order
        foreach ($order->orderItems as $item) {
            $menu = $item->menu;
            // Ambil semua rating untuk menu ini
            $ratings = Rating::where('menu_id', $menu->id)->get();
            
            // Hitung rata-rata rating
            $averageRating = $ratings->avg('rating');
            $ratingCount = $ratings->count();
            
            // Update menu
            $menu->update([
                'rating' => $averageRating,
                'rating_count' => $ratingCount
            ]);
        }
    }

    /**
     * Cancel order oleh user (hanya untuk order pending)
     */
    public function cancelOrder(Order $order)
    {
        $user = auth()->user();

        // Cek kepemilikan order
        if ($order->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Hanya order pending yang bisa dibatalkan
        if ($order->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya pesanan dengan status pending yang bisa dibatalkan'
            ], 400);
        }

        // Update status ke cancelled
        $order->update(['status' => 'cancelled']);

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil dibatalkan'
        ]);
    }

    /**
     * Confirm pickup oleh user untuk order yang sudah ready
     */
    public function confirmPickup(Order $order)
    {
        $user = auth()->user();

        // Cek kepemilikan order
        if ($order->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Cek syarat konfirmasi pickup
        if ($order->status !== 'ready' || $order->delivery_option !== 'pickup') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya pesanan dengan status ready dan pickup yang bisa dikonfirmasi'
            ], 400);
        }

        // Update status ke completed
        $order->update(['status' => 'completed']);

        return response()->json([
            'success' => true,
            'message' => 'Pengambilan pesanan berhasil dikonfirmasi'
        ]);
    }
}