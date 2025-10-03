<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function getUsers(Request $request)
    {
        $role = $request->query('role');
        $search = $request->query('search');
        
        $users = User::when($role, function($query) use ($role) {
            return $query->where('role', $role);
        })
        ->when($search, function($query) use ($search) {
            return $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('kantin_name', 'like', "%{$search}%");
        })
        ->orderBy('created_at', 'desc')
        ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    public function getStats()
    {
        $stats = [
            'total_mahasiswa' => User::mahasiswa()->count(),
            'total_penjual' => User::penjual()->count(),
            'penjual_approved' => User::approvedPenjual()->count(),
            'penjual_pending' => User::penjual()->where('is_approved', false)->count(),
            'total_users' => User::count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    public function getPendingPenjual()
    {
        $pendingPenjual = User::penjual()
            ->where('is_approved', false)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $pendingPenjual
        ]);
    }

    public function approvePenjual($id)
    {
        $user = User::where('role', 'penjual')->findOrFail($id);
        
        if ($user->is_approved) {
            return response()->json([
                'success' => false,
                'message' => 'Penjual sudah disetujui sebelumnya'
            ], 400);
        }

        $user->update(['is_approved' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Penjual berhasil disetujui',
            'data' => $user
        ]);
    }

    public function rejectPenjual($id)
    {
        $user = User::where('role', 'penjual')->findOrFail($id);
        
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Penjual berhasil ditolak dan dihapus'
        ]);
    }

    public function toggleUserStatus($id)
    {
        // dd(auth()->user());
        
        $user = User::findOrFail($id);
        
        
        // Admin tidak bisa nonaktifkan diri sendiri
        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak bisa menonaktifkan akun sendiri'
            ], 400);
        }

        $user->update([
            'is_active' => !$user->is_active
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status user berhasil diupdate',
            'data' => $user
        ]);
    }

    public function getUserDetail($id)
    {
        $user = User::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }
}