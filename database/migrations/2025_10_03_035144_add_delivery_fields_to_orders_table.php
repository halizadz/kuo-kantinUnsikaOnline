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
            $table->enum('delivery_option', ['pickup', 'delivery'])->default('pickup')->after('status');
            $table->text('delivery_address')->nullable()->after('delivery_option');
            $table->timestamp('estimated_time')->nullable()->after('notes');
        });
        
        // For SQLite, we need to recreate the table to modify the enum
        if (DB::getDriverName() === 'sqlite') {
            // SQLite doesn't support MODIFY COLUMN, so we'll skip the status modification
            // The status column will remain as string and we'll handle validation in the application
        } else {
            // For MySQL/PostgreSQL, we can modify the column
            DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'processing', 'ready', 'on_delivery', 'completed', 'cancelled') DEFAULT 'pending'");
        }
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['delivery_option', 'delivery_address', 'estimated_time']);
        });
    }
};