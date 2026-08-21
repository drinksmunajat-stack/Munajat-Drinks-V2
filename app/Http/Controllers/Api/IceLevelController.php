<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\IceLevel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IceLevelController extends Controller
{
    /**
     * Display a listing of ice levels.
     */
    public function index(): JsonResponse
    {
        $iceLevels = IceLevel::orderBy('percentage', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $iceLevels,
        ]);
    }

    /**
     * Store a newly created ice level.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'percentage' => ['required', 'integer', 'min:0', 'max:100'],
            'description' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $iceLevel = IceLevel::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Level es berhasil ditambahkan.',
            'data' => $iceLevel,
        ], 201);
    }

    /**
     * Display the specified ice level.
     */
    public function show(IceLevel $iceLevel): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $iceLevel,
        ]);
    }

    /**
     * Update the specified ice level.
     */
    public function update(Request $request, IceLevel $iceLevel): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:50'],
            'percentage' => ['sometimes', 'required', 'integer', 'min:0', 'max:100'],
            'description' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $iceLevel->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Level es berhasil diperbarui.',
            'data' => $iceLevel,
        ]);
    }

    /**
     * Remove the specified ice level.
     */
    public function destroy(IceLevel $iceLevel): JsonResponse
    {
        $iceLevel->delete();

        return response()->json([
            'success' => true,
            'message' => 'Level es berhasil dihapus.',
        ]);
    }
}
