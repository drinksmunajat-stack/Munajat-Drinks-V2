<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Topping;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ToppingController extends Controller
{
    /**
     * Display a listing of toppings.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Topping::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category') && $request->input('category') !== 'All') {
            $query->where('category', $request->input('category'));
        }

        $toppings = $query->orderBy('id', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $toppings,
        ]);
    }

    /**
     * Store a newly created topping.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'category' => ['required', 'string', 'max:50'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'is_available' => ['sometimes', 'boolean'],
        ]);

        $topping = Topping::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Topping berhasil ditambahkan.',
            'data' => $topping,
        ], 201);
    }

    /**
     * Display the specified topping.
     */
    public function show(Topping $topping): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $topping,
        ]);
    }

    /**
     * Update the specified topping.
     */
    public function update(Request $request, Topping $topping): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'category' => ['sometimes', 'required', 'string', 'max:50'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'stock' => ['sometimes', 'required', 'integer', 'min:0'],
            'is_available' => ['sometimes', 'boolean'],
        ]);

        $topping->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Data topping berhasil diperbarui.',
            'data' => $topping,
        ]);
    }

    /**
     * Remove the specified topping.
     */
    public function destroy(Topping $topping): JsonResponse
    {
        $topping->delete();

        return response()->json([
            'success' => true,
            'message' => 'Topping berhasil dihapus.',
        ]);
    }
}
