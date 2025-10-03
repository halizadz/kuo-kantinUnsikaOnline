<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|max:15',
            'password' => ['required', 'confirmed', Password::min(8)],
            'role' => 'required|in:mahasiswa,penjual',
            'nim' => 'required_if:role,mahasiswa|string|max:20|unique:users',
            'kantin_name' => 'required_if:role,penjual|string|max:255',
            'location' => 'required_if:role,penjual|string|max:255',
            'kantin_photo' => 'required_if:role,penjual|image|mimes:jpeg,png,jpg|max:2048', 
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ];

        // Tambahkan field berdasarkan role
        if ($request->role === 'mahasiswa') {
            $userData['nim'] = $request->nim;
            $userData['is_approved'] = true; // Mahasiswa auto approved
        } else {
            $userData['kantin_name'] = $request->kantin_name;
            $userData['location'] = $request->location;
            $userData['is_approved'] = false; // Penjual butuh approval admin
            // Proses dan simpan foto jika ada
        if ($request->hasFile('kantin_photo')) {
            // Simpan file ke storage/app/public/kantin_photos
            // dan dapatkan path-nya
            $path = $request->file('kantin_photo')->store('public/kantin_photos');
            
            // Simpan hanya path relatifnya ke database
            $userData['kantin_photo_path'] = $path;
        }
        }

        $user = User::create($userData);

        $token = $user->createToken('auth_token')->plainTextToken;

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

public function login(Request $request)
{
    $validator = Validator::make($request->all(), [
        'email' => 'required|email',
        'password' => 'required',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Validasi gagal',
            'errors' => $validator->errors()
        ], 422);
    }

    // Cari user berdasarkan email
    $user = User::where('email', $request->email)->first();

    // Cek apakah user ada dan password benar
    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json([
            'success' => false,
            'message' => 'Email atau password salah'
        ], 401);
    }

    // Cek jika penjual belum approved
    if ($user->isPenjual() && !$user->is_approved) {
        return response()->json([
            'success' => false,
            'message' => 'Akun penjual Anda belum disetujui admin'
        ], 403);
    }

    // Buat token
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

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil'
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $request->user()
            ]
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:15',
            'avatar' => 'sometimes|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

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