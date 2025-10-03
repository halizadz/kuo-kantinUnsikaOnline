<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Menu;

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
        // logger('=== penjualOrders METHOD CALLED ===', [
        //     'user_id' => $request->user()->id,
        //     'user_name' => $request->user()->name,
        //     'user_role' => $request->user()->role,
        //     'is_approved' => $request->user()->is_approved
        // ]);

        $penjual = $request->user();

        $orders = Order::where('penjual_id', $penjual->id)
                        ->with(['user:id,name,phone', 'orderItems.menu:id,name,image'])
                        ->latest()
                        ->paginate(10);

        // logger('Orders loaded for penjual', [
        //     'count' => $orders->count(),
        //     'total' => $orders->total()
        // ]);

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
}