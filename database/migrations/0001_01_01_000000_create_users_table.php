<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('role', ['mahasiswa', 'penjual', 'admin'])->default('mahasiswa');
            $table->string('nim')->nullable(); // khusus mahasiswa
            $table->string('kantin_name')->nullable(); // khusus penjual
            $table->string('location')->nullable(); // khusus penjual
            $table->boolean('is_approved')->default(false); // untuk penjual
            $table->string('avatar')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
};