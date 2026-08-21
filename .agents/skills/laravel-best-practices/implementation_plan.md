# Rencana Implementasi: Integrasi MySQL Database & Laravel REST API CRUD

Menghubungkan seluruh fitur frontend (*Users, Toppings, Ice Levels, Kode Order, Cabang, Products, AI Settings*) ke database MySQL melalui REST API Controller Laravel.

## Proposed Changes

### 1. Database Migration & Seeding (MySQL)
- Menjalankan `php artisan migrate --force` dan `php artisan db:seed --force` untuk memastikan database `db_munajatdrinks_v2` di MySQL terisi struktur tabel dan data awal.

### 2. Laravel API Controllers (`app/Http/Controllers/Api/`)
Membuat REST API controller untuk setiap entitas:
- [NEW] [`app/Http/Controllers/Api/UserController.php`](file:///c:/laragon/www/munajatdrinks_v2/app/Http/Controllers/Api/UserController.php) - Endpoint GET, POST, PUT, DELETE `/api/users`
- [NEW] [`app/Http/Controllers/Api/ToppingController.php`](file:///c:/laragon/www/munajatdrinks_v2/app/Http/Controllers/Api/ToppingController.php) - Endpoint GET, POST, PUT, DELETE `/api/toppings`
- [NEW] [`app/Http/Controllers/Api/IceLevelController.php`](file:///c:/laragon/www/munajatdrinks_v2/app/Http/Controllers/Api/IceLevelController.php) - Endpoint GET, POST, PUT, DELETE `/api/ice-levels`
- [NEW] [`app/Http/Controllers/Api/OrderCodeController.php`](file:///c:/laragon/www/munajatdrinks_v2/app/Http/Controllers/Api/OrderCodeController.php) - Endpoint GET, POST, PUT, DELETE `/api/order-codes`
- [NEW] [`app/Http/Controllers/Api/CabangController.php`](file:///c:/laragon/www/munajatdrinks_v2/app/Http/Controllers/Api/CabangController.php) - Endpoint GET, POST, PUT, DELETE `/api/cabangs`
- [NEW] [`app/Http/Controllers/Api/ProductController.php`](file:///c:/laragon/www/munajatdrinks_v2/app/Http/Controllers/Api/ProductController.php) - Endpoint GET, POST, PUT, DELETE `/api/products`
- [NEW] [`app/Http/Controllers/Api/AiSettingController.php`](file:///c:/laragon/www/munajatdrinks_v2/app/Http/Controllers/Api/AiSettingController.php) - Endpoint GET, PUT `/api/ai-settings`

### 3. API Routes Configuration (`routes/api.php` / `routes/web.php`)
- Mendaftarkan rute API RESTful lengkap di `routes/api.php` atau `routes/web.php` dengan prefix `/api/`.

### 4. Frontend API Integration (React)
- Membuat client API helper [`resources/js/services/api.ts`](file:///c:/laragon/www/munajatdrinks_v2/resources/js/services/api.ts) untuk komunikasi HTTP (`fetch`/`axios`).
- Menghubungkan seluruh halaman:
  - [`resources/js/pages/Users.tsx`](file:///c:/laragon/www/munajatdrinks_v2/resources/js/pages/Users.tsx)
  - [`resources/js/pages/DatabaseToppings.tsx`](file:///c:/laragon/www/munajatdrinks_v2/resources/js/pages/DatabaseToppings.tsx)
  - [`resources/js/pages/DatabaseIceLevels.tsx`](file:///c:/laragon/www/munajatdrinks_v2/resources/js/pages/DatabaseIceLevels.tsx)
  - [`resources/js/pages/DatabaseOrderCodes.tsx`](file:///c:/laragon/www/munajatdrinks_v2/resources/js/pages/DatabaseOrderCodes.tsx)
  - [`resources/js/pages/DatabaseCabang.tsx`](file:///c:/laragon/www/munajatdrinks_v2/resources/js/pages/DatabaseCabang.tsx)
  - [`resources/js/pages/Products.tsx`](file:///c:/laragon/www/munajatdrinks_v2/resources/js/pages/Products.tsx)
  - [`resources/js/pages/AIApiConfig.tsx`](file:///c:/laragon/www/munajatdrinks_v2/resources/js/pages/AIApiConfig.tsx)

## Verification Plan
1. Jalankan migrasi dan seeding database ke MySQL.
2. Uji endpoint API dengan panggilan HTTP (GET/POST/PUT/DELETE).
3. Jalankan `npm run build` untuk memvalidasi TypeScript dan bundle.
4. Lakukan pengujian Create, Read, Update, Delete secara langsung dari antarmuka web.
