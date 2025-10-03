<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Tambah kolom delivery_option dan delivery_address
            $table->string('delivery_option')->default('pickup')->after('status');
            $table->text('delivery_address')->nullable()->after('delivery_option');
            $table->timestamp('estimated_time')->nullable()->after('notes');
        });
        
        // For SQLite, we need to recreate the table to modify the status column
        // But since SQLite doesn't enforce ENUM constraints anyway, we'll just add a check constraint
        DB::statement("UPDATE orders SET status = 'pending' WHERE status NOT IN ('pending', 'processing', 'ready', 'on_delivery', 'completed', 'cancelled')");
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['delivery_option', 'delivery_address', 'estimated_time']);
        });
    }
};