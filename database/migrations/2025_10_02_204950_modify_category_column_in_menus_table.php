<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('menus', function (Blueprint $table) {
            // PENTING: Install package doctrine/dbal dulu
            // Opsi 1: Buat nullable
            $table->string('category')->nullable()->change();
            
            // Opsi 2: Hapus kolom (uncomment jika pilih ini)
            // $table->dropColumn('category');
        });
    }

    public function down(): void
    {
        Schema::table('menus', function (Blueprint $table) {
            // Jika pakai opsi 1
            $table->string('category')->nullable(false)->change();
            
            // Jika pakai opsi 2 (restore kolom)
            // $table->string('category')->after('price');
        });
    }
};