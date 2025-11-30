<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Models\Rating;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\UsersExport;
use App\Exports\OrdersExport;
use App\Exports\MenusExport;
use App\Exports\RatingsExport;

/**
 * Class AdminController
 * 
 * Controller untuk mengelola fungsi-fungsi admin seperti:
 * - Manajemen users (CRUD)
 * - Approval penjual
 * - Statistik dashboard
 * - Export data ke Excel
 */
class AdminController extends Controller
{
    /**
     * Mengambil daftar users dengan pagination dan filter
     */
    public function getUsers(Request $request)
    {
        // Ambil parameter filter dari query string
        $role = $request->query('role');
        $search = $request->query('search');
        
        // Query users dengan soft delete check
        $users = User::whereNull('deleted_at') // Hanya ambil yang tidak dihapus
            ->when($role, function($query) use ($role) {
                // Filter berdasarkan role jika ada
                return $query->where('role', $role);
            })
            ->when($search, function($query) use ($search) {
                // Filter berdasarkan pencarian jika ada
                return $query->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhere('kantin_name', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc') // Urutkan terbaru dulu
            ->paginate(10); // Pagination 10 data per halaman

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Mengambil statistik untuk dashboard admin
     */
    public function getStats()
    {
        $stats = [
            // Hitung total mahasiswa (tidak termasuk yang dihapus)
            'total_mahasiswa' => User::mahasiswa()->whereNull('deleted_at')->count(),
            // Hitung total penjual (tidak termasuk yang dihapus)
            'total_penjual' => User::penjual()->whereNull('deleted_at')->count(),
            // Hitung penjual yang sudah diapprove
            'penjual_approved' => User::approvedPenjual()->whereNull('deleted_at')->count(),
            // Hitung penjual yang masih pending
            'penjual_pending' => User::penjual()->where('is_approved', false)->whereNull('deleted_at')->count(),
            // Hitung total semua users
            'total_users' => User::whereNull('deleted_at')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Mengambil daftar penjual yang menunggu approval
     */
    public function getPendingPenjual()
    {
        // Ambil penjual yang belum diapprove
        $pendingPenjual = User::penjual()
            ->where('is_approved', false)
            ->whereNull('deleted_at') // Tidak termasuk yang dihapus
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $pendingPenjual
        ]);
    }

    /**
     * Approve penjual yang pending
     */
    public function approvePenjual($id)
    {
        // Cari penjual berdasarkan ID
        $user = User::where('role', 'penjual')->whereNull('deleted_at')->findOrFail($id);
        
        // Cek apakah sudah diapprove sebelumnya
        if ($user->is_approved) {
            return response()->json([
                'success' => false,
                'message' => 'Penjual sudah disetujui sebelumnya'
            ], 400);
        }

        // Update status approval
        $user->update(['is_approved' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Penjual berhasil disetujui',
            'data' => $user
        ]);
    }

    /**
     * Reject/tolak penjual dan hapus dari sistem
     */
    public function rejectPenjual($id)
    {
        // Cari penjual berdasarkan ID
        $user = User::where('role', 'penjual')->whereNull('deleted_at')->findOrFail($id);
        
        // Soft delete penjual
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Penjual berhasil ditolak dan dihapus'
        ]);
    }

    /**
     * Toggle status aktif/non-aktif user
     */
    public function toggleUserStatus($id)
    {
        // Cari user berdasarkan ID
        $user = User::whereNull('deleted_at')->findOrFail($id);
        
        // Cegah admin nonaktifkan diri sendiri
        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak bisa menonaktifkan akun sendiri'
            ], 400);
        }

        // Toggle status aktif
        $user->update([
            'is_active' => !$user->is_active
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status user berhasil diupdate',
            'data' => $user
        ]);
    }

    /**
     * Mengambil detail lengkap satu user
     */
    public function getUserDetail($id)
    {
        // Cari user berdasarkan ID
        $user = User::whereNull('deleted_at')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    /**
     * Update data user
     */
    public function updateUser(Request $request, $id)
    {
        try {
            // Log request untuk debugging
            \Log::info('Update user request:', $request->all());
            
            // Cari user berdasarkan ID
            $user = User::whereNull('deleted_at')->findOrFail($id);

            // Convert empty string menjadi null untuk konsistensi database
            $data = array_map(function($value) {
                return $value === '' ? null : $value;
            }, $request->all());

            // Validasi data input
            $validator = Validator::make($data, [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,' . $id, // Unique kecuali untuk user ini
                'phone' => 'required|string|max:15',
                'location' => 'nullable|string|max:255',
                'kantin_name' => 'nullable|string|max:255',
                'nim' => 'nullable|string|max:20|unique:users,nim,' . $id, // Unique kecuali untuk user ini
            ]);

            // Return error jika validasi gagal
            if ($validator->fails()) {
                \Log::error('Validation failed:', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Filter data untuk menghapus field yang null
            $dataToUpdate = array_filter($data, function ($value) {
                return $value !== null;
            });

            \Log::info('Data to update:', $dataToUpdate);

            // Update user data
            $user->update($dataToUpdate);

            \Log::info('User updated successfully:', $user->toArray());

            return response()->json([
                'success' => true,
                'message' => 'User berhasil diupdate',
                'data' => $user
            ]);

        } catch (\Exception $e) {
            // Log error untuk debugging
            \Log::error('Error updating user:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan server: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete user dengan soft delete
     */
    public function deleteUser($id)
    {
        try {
            // Log aksi delete untuk audit trail
            \Log::info('Deleting user:', ['user_id' => $id, 'auth_id' => auth()->id()]);
            
            // Cari user berdasarkan ID
            $user = User::whereNull('deleted_at')->findOrFail($id);
            
            // Cegah admin menghapus diri sendiri
            if ($user->id === auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak bisa menghapus akun sendiri'
                ], 400);
            }
            
            // Gunakan soft delete (data tidak benar-benar dihapus)
            $user->delete();

            \Log::info('User soft deleted successfully');

            return response()->json([
                'success' => true,
                'message' => 'User berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            // Log error untuk debugging
            \Log::error('Error deleting user:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan server: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mengambil semua ratings untuk admin
     */
    public function getAllRatings(Request $request)
    {
        // Query ratings dengan eager loading relasi
        $ratings = Rating::with([
                'user:id,name',  // Ambil nama user
                'menu:id,name',  // Ambil nama menu
                'penjual:id,kantin_name', // Ambil nama kantin
                'order:id,order_number'   // Ambil nomor order
            ])
            ->orderBy('created_at', 'desc') // Urutkan terbaru dulu
            ->paginate(20); // Pagination 20 data per halaman

        return response()->json([
            'success' => true,
            'data' => $ratings
        ]);
    }

    /**
     * Export data users ke Excel
     */
    public function exportUsers(Request $request)
    {
        // Ambil parameter filter
        $role = $request->query('role');
        $search = $request->query('search');
        
        // Generate filename dengan timestamp
        $filename = 'users_' . date('Y-m-d_His') . '.xlsx';
        
        // Download file Excel
        return Excel::download(
            new UsersExport($role, $search), 
            $filename
        );
    }

    /**
     * Export data orders ke Excel
     */
    public function exportOrders(Request $request)
    {
        // Ambil parameter filter
        $status = $request->query('status');
        $penjualId = $request->query('penjual_id');
        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');
        
        // Generate filename dengan timestamp
        $filename = 'orders_' . date('Y-m-d_His') . '.xlsx';
        
        // Download file Excel
        return Excel::download(
            new OrdersExport($status, $penjualId, $dateFrom, $dateTo), 
            $filename
        );
    }

    /**
     * Export data menus ke Excel
     */
    public function exportMenus(Request $request)
    {
        // Ambil parameter filter
        $penjualId = $request->query('penjual_id');
        $isAvailable = $request->query('is_available');
        $category = $request->query('category');
        
        // Generate filename dengan timestamp
        $filename = 'menus_' . date('Y-m-d_His') . '.xlsx';
        
        // Download file Excel
        return Excel::download(
            new MenusExport($penjualId, $isAvailable, $category), 
            $filename
        );
    }

    /**
     * Export data ratings ke Excel
     */
    public function exportRatings(Request $request)
    {
        // Ambil parameter filter
        $penjualId = $request->query('penjual_id');
        $minRating = $request->query('min_rating');
        
        // Generate filename dengan timestamp
        $filename = 'ratings_' . date('Y-m-d_His') . '.xlsx';
        
        // Download file Excel
        return Excel::download(
            new RatingsExport($penjualId, $minRating), 
            $filename
        );
    }
}