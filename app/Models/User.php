<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Class User
 * 
 * Model untuk tabel 'users' yang menyimpan data pengguna.
 * Aplikasi ini memiliki 3 role user:
 * 
 * 1. Admin - Mengelola sistem, approve penjual
 * 2. Penjual - Pemilik kantin yang menjual menu
 * 3. Mahasiswa - Pembeli yang memesan menu
 * 
 * Features:
 * - Multi-role system
 * - Soft deletes (data tidak benar-benar dihapus)
 * - API token authentication (Laravel Sanctum)
 * - Approval system untuk penjual
 */
class User extends Authenticatable
{
    use HasApiTokens,      // Trait untuk API token authentication (Sanctum)
        HasFactory,        // Trait untuk factory (dummy data)
        Notifiable,        // Trait untuk notifikasi (email, SMS, dll)
        SoftDeletes;       // Trait untuk soft delete (deleted_at)

    /**
     * Kolom-kolom yang bisa diisi secara mass assignment
     */
    protected $fillable = [
        'name',             
        'email',            
        'phone',            
        'password',          
        'role',             
        'nim',              
        'kantin_name',       
        'location',          
        'is_approved',      
        'avatar',            
        'kantin_photo_path'  
    ];

    /**
     * Kolom-kolom yang disembunyikan saat serialize ke JSON/Array
     * Untuk keamanan, field sensitif tidak boleh di-expose
     */
    protected $hidden = [
        'password',       
        'remember_token', 
    ];

    /**
     * Casting tipe data kolom
     */
    protected $casts = [
        'email_verified_at' => 'datetime', 
        'password' => 'hashed',            
        'is_approved' => 'boolean'         
    ];

    // ============================================
    // QUERY SCOPES
    // ============================================

    /**
     * Scope untuk filter user dengan role mahasiswa
     */
    public function scopeMahasiswa($query)
    {
        return $query->where('role', 'mahasiswa');
    }

    /**
     * Scope untuk filter user dengan role penjual
     */
    public function scopePenjual($query)
    {
        return $query->where('role', 'penjual');
    }

    /**
     * Scope untuk filter user dengan role admin
     */
    public function scopeAdmin($query)
    {
        return $query->where('role', 'admin');
    }

    /**
     * Scope untuk filter penjual yang sudah diapprove
     */
    public function scopeApprovedPenjual($query)
    {
        return $query->where('role', 'penjual')->where('is_approved', true);
    }

    /**
     * Scope untuk filter penjual yang belum diapprove (pending)
     */
    public function scopePendingPenjual($query)
    {
        return $query->where('role', 'penjual')
                    ->where('is_approved', false);
    }

    // ============================================
    // HELPER METHODS
    // ============================================
    // Method untuk mengecek role user dengan mudah

    /**
     * Cek apakah user adalah mahasiswa
     */
    public function isMahasiswa()
    {
        return $this->role === 'mahasiswa';
    }

    /**
     * Cek apakah user adalah penjual
     */
    public function isPenjual()
    {
        return $this->role === 'penjual';
    }

    /**
     * Cek apakah user adalah admin
     */
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    /**
     * Cek apakah user adalah penjual yang sudah diapprove
     */
    public function isApprovedPenjual()
    {
        return $this->isPenjual() && $this->is_approved;
    }

    // ============================================
    // RELATIONSHIPS
    // ============================================

    /**
     * Relasi: User (penjual) memiliki banyak Menu
     * 
     * Relasi One-to-Many (hasMany):
     * - Satu penjual -> banyak menu
     * 
     * Foreign key: penjual_id di tabel menus
     */
    public function menus()
    {
        return $this->hasMany(Menu::class, 'penjual_id');
    }

    /**
     * Relasi: User (mahasiswa) memiliki banyak Order sebagai pembeli
     */
    public function orders()
    {
        return $this->hasMany(Order::class, 'user_id');
    }

    /**
     * Relasi: User (penjual) memiliki banyak Order sebagai penjual
     */
    public function penjualOrders()
    {
        return $this->hasMany(Order::class, 'penjual_id');
    }

    /**
     * Relasi: User memiliki banyak Rating (sebagai pemberi rating)
     */
    public function ratings()
    {
        return $this->hasMany(Rating::class, 'user_id');
    }

    /**
     * Relasi: User (penjual) menerima banyak Rating
     */
    public function receivedRatings()
    {
        return $this->hasMany(Rating::class, 'penjual_id');
    }
}