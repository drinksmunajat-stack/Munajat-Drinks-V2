<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 30)->nullable()->after('email');
            $table->string('role', 50)->default('User')->after('phone');
            $table->string('branch', 100)->default('Pusat')->after('role');
            $table->string('status', 30)->default('Aktif')->after('branch');
            $table->string('avatar_color', 20)->default('#10b981')->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'role', 'branch', 'status', 'avatar_color']);
        });
    }
};
