<?php

use App\Http\Controllers\Api\AiSettingController;
use App\Http\Controllers\Api\AppSettingController;
use App\Http\Controllers\Api\BillingInvoiceController;
use App\Http\Controllers\Api\CabangController;
use App\Http\Controllers\Api\IceLevelController;
use App\Http\Controllers\Api\OrderCodeController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\ToppingController;
use App\Http\Controllers\Api\UserController;
use App\Models\Cabang;
use App\Models\OrderCode;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes for Munajat Drinks POS & Dashboard
|--------------------------------------------------------------------------
*/

Route::get('/ping', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'Munajat Drinks API is running smoothly',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Users REST API
Route::apiResource('users', UserController::class);

// Products REST API
Route::apiResource('products', ProductController::class);

// Toppings REST API
Route::apiResource('toppings', ToppingController::class);

// Ice Levels REST API
Route::apiResource('ice-levels', IceLevelController::class);

// Cabangs REST API
Route::apiResource('cabangs', CabangController::class);

// Order Codes REST API
Route::apiResource('order-codes', OrderCodeController::class);

// AI Settings API
Route::get('ai-settings', [AiSettingController::class, 'show']);
Route::put('ai-settings', [AiSettingController::class, 'update']);
Route::post('ai-settings', [AiSettingController::class, 'update']);

// App & User Settings CRUD API
Route::get('settings', [AppSettingController::class, 'show']);
Route::put('settings', [AppSettingController::class, 'update']);
Route::post('settings/profile', [AppSettingController::class, 'updateProfile']);
Route::post('settings/password', [AppSettingController::class, 'changePassword']);

// Billing Invoices REST API
Route::apiResource('invoices', BillingInvoiceController::class);

// Projects REST API
Route::apiResource('projects', ProjectController::class);

// Database Summary & Profile Stats API
Route::get('stats/summary', function () {
    $ordersCount = OrderCode::count();
    $totalRevenue = (float) OrderCode::where('payment_status', 'paid')->sum('total_amount');
    if ($totalRevenue == 0) {
        $totalRevenue = (float) OrderCode::sum('total_amount');
    }
    $usersCount = User::count();
    $productsCount = Product::count();
    $cabangsCount = Cabang::count();
    $user = User::where('role', 'Super Admin')->first()
        ?? User::where('role', 'Admin')->first()
        ?? User::first();

    return response()->json([
        'success' => true,
        'data' => [
            'orders_count' => $ordersCount,
            'total_revenue' => $totalRevenue,
            'rating' => 4.9,
            'users_count' => $usersCount,
            'products_count' => $productsCount,
            'cabangs_count' => $cabangsCount,
            'user' => $user ? [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'branch' => $user->branch,
                'status' => $user->status,
                'avatar_color' => $user->avatar_color,
                'created_at' => $user->created_at?->toIso8601String(),
            ] : null,
        ],
    ]);
});
