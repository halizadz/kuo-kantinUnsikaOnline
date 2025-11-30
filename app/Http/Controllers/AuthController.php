<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

/**
 * Class AuthController
 * 
 * Controller untuk mengelola autentikasi user:
 * - Register (mahasiswa dan penjual)
 * - Login
 * - Logout
 * - Profile management
 */
class AuthController extends Controller
{
    /**
     * Register user baru (mahasiswa atau penjual)
     */
    public function register(Request $request)
    {
        // Validasi input registrasi
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users', // Email harus unique
            'phone' => 'required|string|max:15',
            'password' => ['required', 'confirmed', Password::min(8)], // Password min 8 karakter dan harus ada konfirmasi
            'role' => 'required|in:mahasiswa,penjual', // Role hanya boleh mahasiswa atau penjual
            'nim' => 'required_if:role,mahasiswa|string|max:20|unique:users', // NIM wajib untuk mahasiswa
            'kantin_name' => 'required_if:role,penjual|string|max:255', // Nama kantin wajib untuk penjual
            'location' => 'required_if:role,penjual|string|max:255', // Lokasi wajib untuk penjual
            'kantin_photo' => 'required_if:role,penjual|image|mimes:jpeg,png,jpg|max:2048', // Foto kantin wajib untuk penjual
        ]);

        // Return error jika validasi gagal
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Siapkan data user yang akan disimpan
        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password), // Encrypt password
            'role' => $request->role,
        ];

        // Tambahkan field spesifik berdasarkan role
        if ($request->role === 'mahasiswa') {
            $userData['nim'] = $request->nim;
            $userData['is_approved'] = true; // Mahasiswa langsung approved
        } else {
            // Data khusus untuk penjual
            $userData['kantin_name'] = $request->kantin_name;
            $userData['location'] = $request->location;
            $userData['is_approved'] = false; // Penjual butuh approval admin
            
            // Proses upload foto kantin jika ada
            if ($request->hasFile('kantin_photo')) {
                // Simpan file ke storage/app/public/kantin_photos
                $path = $request->file('kantin_photo')->store('public/kantin_photos');
                
                // Simpan path relatif ke database
                $userData['kantin_photo_path'] = $path;
            }
        }

        // Buat user baru di database
        $user = User::create($userData);

        // Generate token untuk autentikasi
        $token = $user->createToken('auth_token')->plainTextToken;

        // Return response berbeda berdasarkan role
        return response()->json([
            'success' => true,
            'message' => $request->role === 'mahasiswa' 
                ? 'Registrasi mahasiswa berhasil' 
                : 'Registrasi penjual berhasil. Menunggu approval admin.',
            'data' => [
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer'
            ]
        ], 201);
    }

    /**
     * Login user
     */
    public function login(Request $request)
    {
        // Validasi input login
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Return error jika validasi gagal
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Cari user berdasarkan email (tidak termasuk yang soft deleted)
        $user = User::where('email', $request->email)
                    ->whereNull('deleted_at') // Pastikan user tidak dihapus
                    ->first();

        // Cek apakah user ada dan password benar
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau password salah'
            ], 401);
        }

        // Cek jika penjual belum approved admin
        if ($user->isPenjual() && !$user->is_approved) {
            return response()->json([
                'success' => false,
                'message' => 'Akun penjual Anda belum disetujui admin'
            ], 403);
        }

        // Buat token untuk autentikasi
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'data' => [
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer'
            ]
        ]);
    }

    /**
     * Logout user (hapus token aktif)
     */
    public function logout(Request $request)
    {
        // Hapus token yang sedang digunakan
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil'
        ]);
    }

    /**
     * Mengambil data user yang sedang login
     */
    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $request->user()
            ]
        ]);
    }

    /**
     * Update profile user
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        // Validasi input (semua field opsional)
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:15',
            'avatar' => 'sometimes|string',
        ]);

        // Return error jika validasi gagal
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update hanya field yang ada di request
        $user->update($request->only(['name', 'phone', 'avatar']));

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diupdate',
            'data' => [
                'user' => $user
            ]
        ]);
    }
}