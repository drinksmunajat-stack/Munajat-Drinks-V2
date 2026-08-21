<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrderCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderCodeController extends Controller
{
    /**
     * Display a listing of orders.
     */
    public function index(Request $request): JsonResponse
    {
        $query = OrderCode::with('cabang');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('order_code', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('cabang_id') && $request->input('cabang_id') !== 'All') {
            $query->where('cabang_id', $request->input('cabang_id'));
        }

        if ($request->filled('order_status') && $request->input('order_status') !== 'All') {
            $query->where('order_status', $request->input('order_status'));
        }

        if ($request->filled('payment_status') && $request->input('payment_status') !== 'All') {
            $query->where('payment_status', $request->input('payment_status'));
        }

        $orders = $query->latest('id')->get();

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * Store a newly created order.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_code' => ['nullable', 'string', 'max:50', 'unique:order_codes,order_code'],
            'cabang_id' => ['nullable', 'exists:cabangs,id'],
            'customer_name' => ['required', 'string', 'max:100'],
            'total_amount' => ['required', 'numeric', 'min:0'],
            'payment_method' => ['required', 'string', 'max:50'],
            'payment_status' => ['required', 'in:pending,paid,failed,refunded'],
            'order_status' => ['required', 'in:in_queue,preparing,ready,completed,cancelled'],
            'notes' => ['nullable', 'string'],
            'items_data' => ['nullable', 'array'],
        ]);

        if (empty($validated['order_code'])) {
            $validated['order_code'] = 'MNJ-'.date('Ymd').'-'.str_pad((string) (OrderCode::count() + 1), 3, '0', STR_PAD_LEFT);
        }

        $order = OrderCode::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil dibuat.',
            'data' => $order->load('cabang'),
        ], 201);
    }

    /**
     * Display the specified order.
     */
    public function show(OrderCode $orderCode): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $orderCode->load('cabang'),
        ]);
    }

    /**
     * Update the specified order.
     */
    public function update(Request $request, OrderCode $orderCode): JsonResponse
    {
        $validated = $request->validate([
            'order_code' => ['sometimes', 'nullable', 'string', 'max:50', Rule::unique('order_codes')->ignore($orderCode->id)],
            'cabang_id' => ['sometimes', 'nullable', 'exists:cabangs,id'],
            'customer_name' => ['sometimes', 'required', 'string', 'max:100'],
            'total_amount' => ['sometimes', 'required', 'numeric', 'min:0'],
            'payment_method' => ['sometimes', 'required', 'string', 'max:50'],
            'payment_status' => ['sometimes', 'required', 'in:pending,paid,failed,refunded'],
            'order_status' => ['sometimes', 'required', 'in:in_queue,preparing,ready,completed,cancelled'],
            'notes' => ['nullable', 'string'],
            'items_data' => ['nullable', 'array'],
        ]);

        $orderCode->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Status pesanan berhasil diperbarui.',
            'data' => $orderCode->load('cabang'),
        ]);
    }

    /**
     * Remove the specified order.
     */
    public function destroy(OrderCode $orderCode): JsonResponse
    {
        $orderCode->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil dihapus.',
        ]);
    }
}
