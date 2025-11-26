<?php
// [file name]: 2025_10_05_000001_add_rating_fields_to_orders_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->boolean('is_rated')->default(false)->after('estimated_time');
            $table->decimal('average_rating', 3, 2)->nullable()->after('is_rated');
        });
        
        Schema::table('order_items', function (Blueprint $table) {
            $table->boolean('is_rated')->default(false)->after('price');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['is_rated', 'average_rating']);
        });
        
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn('is_rated');
        });
    }
};