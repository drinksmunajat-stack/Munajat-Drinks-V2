<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cabang;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CabangController extends Controller
{
    /**
     * Display a listing of cabangs.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Cabang::withCount('orders');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('manager_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $status = $request->input('status');
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $cabangs = $query->orderBy('id', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $cabangs,
        ]);
    }

    /**
     * Store a newly created cabang.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:20', 'unique:cabangs,code'],
            'name' => ['required', 'string', 'max:100'],
            'address' => ['required', 'string'],
            'city' => ['required', 'string', 'max:50'],
            'phone' => ['nullable', 'string', 'max:30'],
            'manager_name' => ['nullable', 'string', 'max:100'],
            'opening_hours' => ['nullable', 'string', 'max:100'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $cabang = Cabang::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Cabang berhasil ditambahkan.',
            'data' => $cabang,
        ], 201);
    }

    /**
     * Display the specified cabang.
     */
    public function show(Cabang $cabang): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $cabang->load('orders'),
        ]);
    }

    /**
     * Update the specified cabang.
     */
    public function update(Request $request, Cabang $cabang): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['sometimes', 'required', 'string', 'max:20', Rule::unique('cabangs')->ignore($cabang->id)],
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'address' => ['sometimes', 'required', 'string'],
            'city' => ['sometimes', 'required', 'string', 'max:50'],
            'phone' => ['nullable', 'string', 'max:30'],
            'manager_name' => ['nullable', 'string', 'max:100'],
            'opening_hours' => ['nullable', 'string', 'max:100'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $cabang->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Data cabang berhasil diperbarui.',
            'data' => $cabang,
        ]);
    }

    /**
     * Remove the specified cabang.
     */
    public function destroy(Cabang $cabang): JsonResponse
    {
        $cabang->delete();

        return response()->json([
            'success' => true,
            'message' => 'Cabang berhasil dihapus.',
        ]);
    }
}
