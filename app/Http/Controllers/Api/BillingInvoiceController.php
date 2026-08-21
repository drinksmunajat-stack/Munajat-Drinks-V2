<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BillingInvoice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BillingInvoiceController extends Controller
{
    /**
     * Display a listing of invoices.
     */
    public function index(): JsonResponse
    {
        $invoices = BillingInvoice::orderByDesc('billing_date')->get();

        return response()->json([
            'success' => true,
            'data' => $invoices,
        ]);
    }

    /**
     * Store a newly created invoice.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'invoice_number' => 'required|string|unique:billing_invoices,invoice_number',
            'plan_name' => 'required|string|max:100',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'sometimes|string|max:50',
            'status' => 'sometimes|in:paid,pending,failed,refunded',
            'billing_date' => 'required|date',
            'due_date' => 'nullable|date',
            'download_url' => 'nullable|string',
        ]);

        $invoice = BillingInvoice::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Invoice created successfully.',
            'data' => $invoice,
        ], 201);
    }

    /**
     * Display the specified invoice.
     */
    public function show(BillingInvoice $billingInvoice): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $billingInvoice,
        ]);
    }

    /**
     * Update the specified invoice.
     */
    public function update(Request $request, BillingInvoice $billingInvoice): JsonResponse
    {
        $validated = $request->validate([
            'plan_name' => 'sometimes|string|max:100',
            'amount' => 'sometimes|numeric|min:0',
            'payment_method' => 'sometimes|string|max:50',
            'status' => 'sometimes|in:paid,pending,failed,refunded',
            'billing_date' => 'sometimes|date',
            'due_date' => 'nullable|date',
            'download_url' => 'nullable|string',
        ]);

        $billingInvoice->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Invoice updated successfully.',
            'data' => $billingInvoice,
        ]);
    }

    /**
     * Remove the specified invoice.
     */
    public function destroy(BillingInvoice $billingInvoice): JsonResponse
    {
        $billingInvoice->delete();

        return response()->json([
            'success' => true,
            'message' => 'Invoice deleted successfully.',
        ]);
    }
}
