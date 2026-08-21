<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiSettingController extends Controller
{
    /**
     * Get active or specific provider AI setting.
     */
    public function show(Request $request): JsonResponse
    {
        $provider = $request->query('provider', 'gemini');
        $setting = AiSetting::where('provider', $provider)->first();

        if (! $setting) {
            $setting = AiSetting::firstOrCreate(
                ['provider' => $provider],
                [
                    'api_key' => '',
                    'model' => $provider === 'gemini' ? 'gemini-1.5-flash' : ($provider === 'openai' ? 'gpt-4o-mini' : 'claude-3-5-sonnet-20241022'),
                    'voice_persona' => 'Kasir Cerdas & Ramah (Duolingo Style)',
                    'system_prompt' => 'Anda adalah Kasir AI resmi dari Munajat Drinks.',
                    'temperature' => 0.7,
                    'is_active' => true,
                ]
            );
        }

        return response()->json([
            'success' => true,
            'data' => $setting,
        ]);
    }

    /**
     * Update or create AI setting.
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'provider' => ['required', 'string', 'in:gemini,openai,claude,groq'],
            'api_key' => ['nullable', 'string'],
            'model' => ['required', 'string', 'max:100'],
            'voice_persona' => ['nullable', 'string', 'max:100'],
            'system_prompt' => ['nullable', 'string'],
            'temperature' => ['required', 'numeric', 'min:0', 'max:2'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $setting = AiSetting::updateOrCreate(
            ['provider' => $validated['provider']],
            $validated
        );

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan AI API berhasil disimpan.',
            'data' => $setting,
        ]);
    }
}
