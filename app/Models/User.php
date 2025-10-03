<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

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

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_approved' => 'boolean'
    ];

    // Scope methods
// Scope methods
public function scopeMahasiswa($query)  // ← Tambah prefix "scope"
{
    return $query->where('role', 'mahasiswa');
}

public function scopePenjual($query)
{
    return $query->where('role', 'penjual');
}

public function scopeAdmin($query)
{
    return $query->where('role', 'admin');
}

public function scopeApprovedPenjual($query)
{
    return $query->where('role', 'penjual')->where('is_approved', true);
}

public function scopePendingPenjual($query)
{
    return $query->where('role', 'penjual')
                ->where('is_approved', false);
}

// Helper methods (ini tetap tanpa "scope")
public function isMahasiswa()
{
    return $this->role === 'mahasiswa';
}

public function isPenjual()
{
    return $this->role === 'penjual';
}

public function isAdmin()
{
    return $this->role === 'admin';
}

    public function isApprovedPenjual()
    {
        return $this->isPenjual() && $this->is_approved;
    }

    // Relationships
    public function menus()
    {
        return $this->hasMany(Menu::class, 'penjual_id');
    }
}