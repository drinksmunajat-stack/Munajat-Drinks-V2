<?php

namespace Database\Seeders;

use App\Models\AiSetting;
use App\Models\Cabang;
use App\Models\IceLevel;
use App\Models\OrderCode;
use App\Models\Product;
use App\Models\Topping;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Users
        $usersData = [
            ['name' => 'Alex Chen', 'email' => 'alex@munajatdrinks.com', 'phone' => '+62 811 868 3080', 'role' => 'Super Admin', 'branch' => 'Pusat (Semua Cabang)', 'status' => 'Aktif', 'avatar_color' => '#10b981'],
            ['name' => 'Siti Nurhaliza', 'email' => 'siti.manager@munajatdrinks.com', 'phone' => '+62 813-9876-5432', 'role' => 'Store Manager', 'branch' => 'Sudirman Hub', 'status' => 'Aktif', 'avatar_color' => '#06b6d4'],
            ['name' => 'Rian Hidayat', 'email' => 'rian.tebet@munajatdrinks.com', 'phone' => '+62 856-1122-3344', 'role' => 'Store Manager', 'branch' => 'Tebet Eco Park', 'status' => 'Aktif', 'avatar_color' => '#8b5cf6'],
            ['name' => 'Maya Anggraini', 'email' => 'maya.dago@munajatdrinks.com', 'phone' => '+62 821-5566-7788', 'role' => 'Store Manager', 'branch' => 'Dago Heritage Bandung', 'status' => 'Aktif', 'avatar_color' => '#f59e0b'],
            ['name' => 'Dimas Pratama', 'email' => 'dimas.barista@munajatdrinks.com', 'phone' => '+62 878-3344-5566', 'role' => 'Barista', 'branch' => 'Grand Indonesia (Pusat)', 'status' => 'Aktif', 'avatar_color' => '#10b981'],
            ['name' => 'Anisa Rahma', 'email' => 'anisa.kasir@munajatdrinks.com', 'phone' => '+62 819-7788-9900', 'role' => 'Kasir', 'branch' => 'Grand Indonesia (Pusat)', 'status' => 'Aktif', 'avatar_color' => '#ec4899'],
            ['name' => 'Budi Santoso', 'email' => 'budi.santoso@gmail.com', 'phone' => '+62 812-9988-7766', 'role' => 'User', 'branch' => 'Pelanggan Member', 'status' => 'Aktif', 'avatar_color' => '#3b82f6'],
            ['name' => 'Dewi Sartika', 'email' => 'dewi.sartika@gmail.com', 'phone' => '+62 857-4455-6677', 'role' => 'User', 'branch' => 'Pelanggan Member', 'status' => 'Aktif', 'avatar_color' => '#f97316'],
        ];

        foreach ($usersData as $u) {
            User::firstOrCreate(
                ['email' => $u['email']],
                array_merge($u, ['password' => bcrypt('password')])
            );
        }

        // 2. Cabangs
        $cabangUtama = Cabang::firstOrCreate(
            ['code' => 'CBG-001'],
            [
                'name' => 'Munajat Drinks - Grand Indonesia (Pusat)',
                'address' => 'Jl. M.H. Thamrin No.1, Jakarta Pusat',
                'city' => 'Jakarta Pusat',
                'phone' => '+62 811 868 3080',
                'manager_name' => 'Alex Chen',
                'opening_hours' => '08:00 - 22:00',
                'is_active' => true,
            ]
        );

        $cabangSudirman = Cabang::firstOrCreate(
            ['code' => 'CBG-002'],
            [
                'name' => 'Munajat Drinks - Sudirman Hub',
                'address' => 'Gedung Wisma GKBI Lt. Dasar, Jakarta Selatan',
                'city' => 'Jakarta Selatan',
                'phone' => '+62 813-9876-5432',
                'manager_name' => 'Siti Nurhaliza',
                'opening_hours' => '07:30 - 21:00',
                'is_active' => true,
            ]
        );

        Cabang::firstOrCreate(
            ['code' => 'CBG-003'],
            [
                'name' => 'Munajat Drinks - Tebet Eco Park',
                'address' => 'Jl. Tebet Barat Raya No. 45, Jakarta Selatan',
                'city' => 'Jakarta Selatan',
                'phone' => '+62 856-1122-3344',
                'manager_name' => 'Rian Hidayat',
                'opening_hours' => '09:00 - 23:00',
                'is_active' => true,
            ]
        );

        // 3. Products
        $productsData = [
            ['code' => 'PRD-01', 'name' => 'Es Kopi Susu Aren', 'category' => 'Kopi', 'price' => 25000, 'cost_price' => 11000, 'stock' => 140, 'badge' => 'Terlaris', 'description' => 'Espresso arabica blend pilihan dipadukan susu segar dan gula aren murni premium.'],
            ['code' => 'PRD-02', 'name' => 'Matcha Latte Signature', 'category' => 'Non-Kopi', 'price' => 28000, 'cost_price' => 13000, 'stock' => 85, 'badge' => 'Favorit', 'description' => 'Bubuk matcha Uji Jepang premium dengan steamed milk lembut dan manis seimbang.'],
            ['code' => 'PRD-03', 'name' => 'Teh Tarik Munajat', 'category' => 'Non-Kopi', 'price' => 18000, 'cost_price' => 7500, 'stock' => 210, 'badge' => null, 'description' => 'Black tea beraroma harum ditarik tradisional dengan krimer kental manis gurih.'],
            ['code' => 'PRD-04', 'name' => 'Brown Sugar Caramel Latte', 'category' => 'Kopi', 'price' => 30000, 'cost_price' => 14000, 'stock' => 95, 'badge' => 'Trending', 'description' => 'Double espresso dengan sirup karamel bakar dan brown sugar glaze di dinding cup.'],
            ['code' => 'PRD-05', 'name' => 'Coconut Pandan Frappe', 'category' => 'Frappe', 'price' => 32000, 'cost_price' => 15000, 'stock' => 60, 'badge' => 'Baru', 'description' => 'Blended kelapa muda asli berpadu ekstrak pandan wangi dan whipped cream lembut.'],
            ['code' => 'PRD-06', 'name' => 'Sparkling Lychee Tea', 'category' => 'Frappe', 'price' => 22000, 'cost_price' => 9000, 'stock' => 115, 'badge' => 'Segar', 'description' => 'Jasmine tea berkarbonasi dingin dengan buah leci utuh dan mint segar.'],
        ];

        foreach ($productsData as $prd) {
            Product::firstOrCreate(['code' => $prd['code']], $prd);
        }

        // 4. Toppings
        $toppingsData = [
            ['name' => 'Golden Boba Pearl', 'category' => 'Boba', 'price' => 5000, 'stock' => 250, 'is_available' => true],
            ['name' => 'Cheese Cream Foam', 'category' => 'Foam', 'price' => 7000, 'stock' => 120, 'is_available' => true],
            ['name' => 'Egg Pudding Lembut', 'category' => 'Pudding', 'price' => 6000, 'stock' => 90, 'is_available' => true],
            ['name' => 'Grass Jelly (Cincau Hitam)', 'category' => 'Jelly', 'price' => 4000, 'stock' => 180, 'is_available' => true],
            ['name' => 'Oreo Crumb Crunch', 'category' => 'Crunch', 'price' => 5000, 'stock' => 130, 'is_available' => true],
            ['name' => 'Extra Shot Espresso', 'category' => 'Coffee', 'price' => 8000, 'stock' => 300, 'is_available' => true],
        ];

        foreach ($toppingsData as $top) {
            Topping::firstOrCreate(['name' => $top['name']], $top);
        }

        // 5. Ice Levels
        $iceData = [
            ['name' => 'No Ice', 'percentage' => 0, 'description' => 'Tanpa es batu sama sekali (suhu ruangan/dingin alami)', 'is_active' => true],
            ['name' => 'Less Ice (Sedikit Es)', 'percentage' => 30, 'description' => 'Es batu 30%, rasa minuman lebih pekat', 'is_active' => true],
            ['name' => 'Normal Ice (Standar)', 'percentage' => 70, 'description' => 'Es batu 70%, kesegaran proporsional standar racikan', 'is_active' => true],
            ['name' => 'Extra Ice (Banyak Es)', 'percentage' => 100, 'description' => 'Es batu penuh 100%, ekstra dingin dan segar maksimal', 'is_active' => true],
        ];

        foreach ($iceData as $ice) {
            IceLevel::firstOrCreate(['name' => $ice['name']], $ice);
        }

        // 6. Order Codes
        OrderCode::firstOrCreate(
            ['order_code' => 'MNJ-20260820-001'],
            [
                'cabang_id' => $cabangUtama->id,
                'customer_name' => 'Rizky Pratama',
                'total_amount' => 55000,
                'payment_method' => 'QRIS',
                'payment_status' => 'paid',
                'order_status' => 'completed',
                'notes' => 'Less sugar, takeaway',
                'items_data' => [
                    ['name' => 'Es Kopi Susu Aren', 'qty' => 2, 'price' => 25000, 'ice' => 'Less Ice (30%)', 'topping' => 'Golden Boba Pearl'],
                ],
            ]
        );

        OrderCode::firstOrCreate(
            ['order_code' => 'MNJ-20260820-002'],
            [
                'cabang_id' => $cabangSudirman->id,
                'customer_name' => 'Dewi Sartika',
                'total_amount' => 35000,
                'payment_method' => 'BCA Virtual Account',
                'payment_status' => 'paid',
                'order_status' => 'preparing',
                'notes' => 'Extra cheese foam',
                'items_data' => [
                    ['name' => 'Matcha Latte Signature', 'qty' => 1, 'price' => 28000, 'ice' => 'Normal Ice (70%)', 'topping' => 'Cheese Cream Foam'],
                ],
            ]
        );

        // 7. AI Settings
        AiSetting::firstOrCreate(
            ['provider' => 'gemini'],
            [
                'api_key' => 'AIzaSyDemoKeyExampleSecuredSecret',
                'model' => 'gemini-1.5-flash',
                'voice_persona' => 'Kasir Cerdas Ramah Munajat Drinks (Duolingo Style)',
                'system_prompt' => 'Anda adalah Kasir AI resmi dari Munajat Drinks. Karakter Anda ceria, ramah, cekatan, dan suka memberi rekomendasi minuman kekinian.',
                'temperature' => 0.7,
                'is_active' => true,
            ]
        );

        // 8. App Settings
        $adminUser = User::where('role', 'Super Admin')->first() ?? User::first();
        \App\Models\AppSetting::firstOrCreate(
            ['id' => 1],
            [
                'user_id' => $adminUser?->id,
                'email_notifications' => true,
                'push_notifications' => false,
                'weekly_digest' => true,
                'bg_mode' => 'animated',
                'transparency' => true,
                'color_mode' => 'dark',
                'two_factor_enabled' => false,
                'session_timeout' => 60,
                'auth_security_level' => 'Enhanced (256-bit SSL)',
                'plan_name' => 'Enterprise POS & Voice AI Pro',
                'plan_billing_cycle' => 'Monthly',
                'plan_price' => 299000,
                'plan_status' => 'Active',
                'payment_gateway' => 'QRIS & Midtrans Automated',
                'merchant_id' => 'MD-QRIS-2026-X88',
                'billing_email' => 'finance@munajatdrinks.com',
            ]
        );

        // 9. Billing Invoices
        $invoicesData = [
            [
                'invoice_number' => 'INV-2026-08-001',
                'plan_name' => 'Enterprise POS & Voice AI Pro (Monthly)',
                'amount' => 299000,
                'payment_method' => 'QRIS Auto-Debit',
                'status' => 'paid',
                'billing_date' => '2026-08-01',
                'due_date' => '2026-08-05',
                'download_url' => '/invoices/INV-2026-08-001.pdf',
            ],
            [
                'invoice_number' => 'INV-2026-07-001',
                'plan_name' => 'Enterprise POS & Voice AI Pro (Monthly)',
                'amount' => 299000,
                'payment_method' => 'QRIS Auto-Debit',
                'status' => 'paid',
                'billing_date' => '2026-07-01',
                'due_date' => '2026-07-05',
                'download_url' => '/invoices/INV-2026-07-001.pdf',
            ],
            [
                'invoice_number' => 'INV-2026-06-001',
                'plan_name' => 'Enterprise POS & Voice AI Pro (Monthly)',
                'amount' => 299000,
                'payment_method' => 'Bank Transfer BCA',
                'status' => 'paid',
                'billing_date' => '2026-06-01',
                'due_date' => '2026-06-05',
                'download_url' => '/invoices/INV-2026-06-001.pdf',
            ],
        ];

        foreach ($invoicesData as $inv) {
            \App\Models\BillingInvoice::firstOrCreate(['invoice_number' => $inv['invoice_number']], $inv);
        }

        // 10. Projects
        $projectsData = [
            ['name' => 'Voice AI Cashier 2.0', 'description' => 'Two-way duplex streaming speech recognition and TTS integration.', 'progress' => 95, 'color' => '#10b981', 'members' => 4, 'days_left' => 2, 'status' => 'In Progress'],
            ['name' => 'Multi-Branch Inventory Sync', 'description' => 'Centralized ingredient COGS tracking and real-time stock alert matrix.', 'progress' => 80, 'color' => '#06b6d4', 'members' => 3, 'days_left' => 7, 'status' => 'In Progress'],
            ['name' => 'Dynamic QRIS Settlement', 'description' => 'Instant barcode QRIS generator with auto callback reconciliation.', 'progress' => 100, 'color' => '#8b5cf6', 'members' => 2, 'days_left' => 0, 'status' => 'Completed'],
            ['name' => 'Customer Loyalty Mobile Web', 'description' => 'Points and rewards catalog for recurring cup orders.', 'progress' => 40, 'color' => '#f59e0b', 'members' => 5, 'days_left' => 18, 'status' => 'In Progress'],
        ];

        foreach ($projectsData as $proj) {
            \App\Models\Project::firstOrCreate(['name' => $proj['name']], $proj);
        }
    }
}
