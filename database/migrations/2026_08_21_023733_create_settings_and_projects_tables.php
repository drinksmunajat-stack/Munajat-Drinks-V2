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
        // 1. App Settings Table
        Schema::create('app_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            
            // Notification preferences
            $table->boolean('email_notifications')->default(true);
            $table->boolean('push_notifications')->default(false);
            $table->boolean('weekly_digest')->default(true);
            
            // Appearance preferences
            $table->string('bg_mode', 30)->default('animated'); // animated, static
            $table->boolean('transparency')->default(true);
            $table->string('color_mode', 30)->default('dark'); // dark, light
            
            // Security settings
            $table->boolean('two_factor_enabled')->default(false);
            $table->integer('session_timeout')->default(60); // minutes
            $table->string('auth_security_level', 30)->default('Standard');
            
            // Billing & Plan settings
            $table->string('plan_name', 100)->default('Enterprise POS & Voice AI Pro');
            $table->string('plan_billing_cycle', 30)->default('Monthly');
            $table->decimal('plan_price', 12, 2)->default(299000);
            $table->string('plan_status', 30)->default('Active');
            $table->string('payment_gateway', 100)->default('QRIS & Midtrans Automated');
            $table->string('merchant_id', 100)->default('MD-QRIS-2026-X88');
            $table->string('billing_email', 150)->nullable();
            
            $table->timestamps();
        });

        // 2. Billing Invoices Table
        Schema::create('billing_invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number', 50)->unique();
            $table->string('plan_name', 100);
            $table->decimal('amount', 12, 2);
            $table->string('payment_method', 50)->default('QRIS');
            $table->enum('status', ['paid', 'pending', 'failed', 'refunded'])->default('paid');
            $table->date('billing_date');
            $table->date('due_date')->nullable();
            $table->string('download_url')->nullable();
            $table->timestamps();
        });

        // 3. Projects Table
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->text('description')->nullable();
            $table->integer('progress')->default(0);
            $table->string('color', 30)->default('#8b5cf6');
            $table->integer('members')->default(2);
            $table->integer('days_left')->default(14);
            $table->string('status', 50)->default('In Progress');
            $table->timestamps();
        });

        // 4. Ensure avatar column exists on users table
        if (!Schema::hasColumn('users', 'avatar')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('avatar')->nullable()->after('avatar_color');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('users', 'avatar')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('avatar');
            });
        }

        Schema::dropIfExists('projects');
        Schema::dropIfExists('billing_invoices');
        Schema::dropIfExists('app_settings');
    }
};
