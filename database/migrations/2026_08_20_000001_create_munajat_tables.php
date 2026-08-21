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
        // 1. Cabang Table
        Schema::create('cabangs', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('name', 100);
            $table->string('address');
            $table->string('city', 50);
            $table->string('phone', 30)->nullable();
            $table->string('manager_name', 100)->nullable();
            $table->string('opening_hours', 100)->default('08:00 - 22:00');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Products Table
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->nullable()->unique();
            $table->string('name', 150);
            $table->string('category', 50)->default('Kopi');
            $table->decimal('price', 12, 2)->default(0);
            $table->decimal('cost_price', 12, 2)->default(0);
            $table->integer('stock')->default(100);
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->string('badge')->nullable(); // e.g. Terlaris, Promo, Baru
            $table->boolean('is_available')->default(true);
            $table->timestamps();
        });

        // 3. Toppings Table
        Schema::create('toppings', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('category', 50)->default('Topping');
            $table->decimal('price', 12, 2)->default(0);
            $table->integer('stock')->default(100);
            $table->boolean('is_available')->default(true);
            $table->timestamps();
        });

        // 4. Ice Levels Table
        Schema::create('ice_levels', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50); // e.g. "No Ice", "Less Ice", "Normal Ice", "Extra Ice"
            $table->integer('percentage')->default(100); // 0, 30, 70, 100
            $table->string('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 5. Order Codes / Orders Table
        Schema::create('order_codes', function (Blueprint $table) {
            $table->id();
            $table->string('order_code', 50)->unique();
            $table->foreignId('cabang_id')->nullable()->constrained('cabangs')->nullOnDelete();
            $table->string('customer_name', 100)->default('Pelanggan');
            $table->decimal('total_amount', 14, 2)->default(0);
            $table->string('payment_method', 50)->default('QRIS');
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('paid');
            $table->enum('order_status', ['in_queue', 'preparing', 'ready', 'completed', 'cancelled'])->default('completed');
            $table->text('notes')->nullable();
            $table->json('items_data')->nullable();
            $table->timestamps();
        });

        // 6. AI API Settings Table
        Schema::create('ai_settings', function (Blueprint $table) {
            $table->id();
            $table->string('provider', 50)->default('gemini'); // gemini, openai, claude, groq
            $table->text('api_key')->nullable();
            $table->string('model', 100)->default('gemini-1.5-flash');
            $table->string('voice_persona', 100)->default('Kasir Ramah Munajat Drinks');
            $table->text('system_prompt')->nullable();
            $table->float('temperature')->default(0.7);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_settings');
        Schema::dropIfExists('order_codes');
        Schema::dropIfExists('ice_levels');
        Schema::dropIfExists('toppings');
        Schema::dropIfExists('products');
        Schema::dropIfExists('cabangs');
    }
};
