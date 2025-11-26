<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Menu;
use App\Models\Rating; // TAMBAHAN: Import model Rating

class OrderController extends Controller
{
    public function store(Request $request)
    {
        // PERBAIKAN VALIDASI
        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.menu_id' => 'required|integer|exists:menus,id',
            'items.*.quantity' => 'required|integer|min:1',
            'delivery_option' => 'required|string|in:pickup,delivery',
            'delivery_address' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:1000',
        ]);

        $validator->after(function ($validator) use ($request) {
            if ($request->delivery_option === 'delivery' && empty($request->delivery_address)) {
                $validator->errors()->add('delivery_address', 'Alamat pengantaran wajib diisi untuk opsi delivery');
            }
        });

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Data pesanan tidak valid',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $cartItems = $request->items;

        $menuIds = array_column($cartItems, 'menu_id');
        $menus = Menu::find($menuIds)->keyBy('id');

        $ordersByPenjual = [];
        foreach ($cartItems as $item) {
            $menu = $menus->get($item['menu_id']);
            if ($menu) {
                if (!$menu->is_available) {
                    return response()->json([
                        'success' => false,
                        'message' => "Menu '{$menu->name}' sedang tidak tersedia."
                    ], 400);
                }
                $penjualId = $menu->penjual_id;
                $ordersByPenjual[$penjualId][] = [
                    'menu' => $menu,
                    'quantity' => $item['quantity']
                ];
            }
        }
        
        $createdOrders = [];

        DB::beginTransaction();
        try {
            foreach ($ordersByPenjual as $penjualId => $items) {
                $totalPrice = array_reduce($items, function ($sum, $item) {
                    return $sum + ($item['menu']->price * $item['quantity']);
                }, 0);

                $maxPrepTime = array_reduce($items, function ($max, $item) {
                    return max($max, $item['menu']->prep_time);
                }, 0);

                $estimatedTime = now()->addMinutes($maxPrepTime + ($request->delivery_option === 'delivery' ? 10 : 0));

                $order = Order::create([
                    'user_id' => $user->id,
                    'penjual_id' => $penjualId,
                    'order_number' => 'ORD-' . strtoupper(uniqid()),
                    'total_price' => $totalPrice,
                    'status' => 'pending',
                    'delivery_option' => $request->delivery_option,
                    'delivery_address' => $request->delivery_address,
                    'notes' => $request->notes,
                    'estimated_time' => $estimatedTime,
                ]);

                $orderItemsData = [];
                foreach ($items as $item) {
                    $orderItemsData[] = [
                        'order_id' => $order->id,
                        'menu_id' => $item['menu']->id,
                        'quantity' => $item['quantity'],
                        'price' => $item['menu']->price,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
                OrderItem::insert($orderItemsData);
                
                $createdOrders[] = $order->load('orderItems.menu', 'penjual');
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pesanan berhasil dibuat!',
                'data' => $createdOrders
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat pesanan, terjadi kesalahan server.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function penjualOrders(Request $request)
    {
        $penjual = $request->user();

        $orders = Order::where('penjual_id', $penjual->id)
                        ->with(['user:id,name,phone', 'orderItems.menu:id,name,image'])
                        ->latest()
                        ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $penjual = $request->user();

        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:processing,ready,on_delivery,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $order = Order::find($id);

        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Pesanan tidak ditemukan'], 404);
        }

        if ($order->penjual_id !== $penjual->id) {
            return response()->json(['success' => false, 'message' => 'Anda tidak memiliki akses ke pesanan ini'], 403);
        }

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

    public function userOrders(Request $request)
    {
        $user = $request->user();

        $orders = Order::where('user_id', $user->id)
                        ->with(['penjual:id,kantin_name,location', 'orderItems.menu:id,name,image'])
                        ->latest()
                        ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    public function show($id)
    {
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

    // TAMBAHAN: Method untuk submit rating
    public function submitRating(Order $order, Request $request)
    {
        $request->validate([
            'rating' => 'required|numeric|min:1|max:5',
            'review' => 'nullable|string|max:1000'
        ]);

        // Check if order belongs to user
        if ($order->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Check if order is completed
        if ($order->status !== 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya pesanan yang sudah selesai yang bisa diberi rating'
            ], 400);
        }

        // Check if already rated
        if ($order->is_rated) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan ini sudah diberi rating'
            ], 400);
        }

        DB::transaction(function () use ($order, $request) {
            // Create rating for each menu item
            foreach ($order->orderItems as $item) {
                Rating::create([
                    'order_id' => $order->id,
                    'user_id' => auth()->id(),
                    'penjual_id' => $order->penjual_id,
                    'menu_id' => $item->menu_id,
                    'rating' => $request->rating,
                    'review' => $request->review
                ]);

                // Update order item as rated
                $item->update(['is_rated' => true]);
            }

            // Update order as rated
            $order->update([
                'is_rated' => true,
                'average_rating' => $request->rating
            ]);

            // Update menu average rating
            $this->updateMenuRating($order);
        });

        return response()->json([
            'success' => true,
            'message' => 'Rating berhasil disimpan'
        ]);
    }

    // TAMBAHAN: Method untuk update rating menu
    private function updateMenuRating($order)
    {
        foreach ($order->orderItems as $item) {
            $menu = $item->menu;
            $ratings = Rating::where('menu_id', $menu->id)->get();
            
            $averageRating = $ratings->avg('rating');
            $ratingCount = $ratings->count();
            
            $menu->update([
                'rating' => $averageRating,
                'rating_count' => $ratingCount
            ]);
        }
    }

    // TAMBAHAN: Method untuk cancel order
    public function cancelOrder(Order $order)
    {
        $user = auth()->user();

        // Check if order belongs to user
        if ($order->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Check if order can be cancelled (only pending orders)
        if ($order->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya pesanan dengan status pending yang bisa dibatalkan'
            ], 400);
        }

        $order->update(['status' => 'cancelled']);

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil dibatalkan'
        ]);
    }

    // TAMBAHAN: Method untuk confirm pickup
    public function confirmPickup(Order $order)
    {
        $user = auth()->user();

        // Check if order belongs to user
        if ($order->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Check if order is ready for pickup
        if ($order->status !== 'ready' || $order->delivery_option !== 'pickup') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya pesanan dengan status ready dan pickup yang bisa dikonfirmasi'
            ], 400);
        }

        $order->update(['status' => 'completed']);

        return response()->json([
            'success' => true,
            'message' => 'Pengambilan pesanan berhasil dikonfirmasi'
        ]);
    }
}