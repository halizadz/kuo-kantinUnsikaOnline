<?php
// [file name]: 2025_10_05_000000_create_ratings_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('penjual_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('menu_id')->constrained('menus')->onDelete('cascade');
            $table->decimal('rating', 2, 1); // 1.0 - 5.0
            $table->text('review')->nullable();
            $table->timestamps();
            
            // Ensure one rating per order
            $table->unique(['order_id', 'user_id', 'menu_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ratings');
    }
};