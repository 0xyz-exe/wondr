<?php

namespace App\Http\Controllers;

use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function __construct(
        protected PaymentService $paymentService
    ) {}

    public function handlePayment(string $provider, Request $request): JsonResponse
    {
        $payload = $request->all();
        $signature = $request->header('X-Signature') ?? $request->header('Signature') ?? $payload['signature_key'] ?? null;

        if (! $this->paymentService->verifyWebhookSignature($provider, $payload, $signature)) {
            Log::warning('Payment webhook rejected: invalid signature', ['provider' => $provider, 'payload' => $payload]);
            return response()->json(['status' => 'error', 'message' => 'Invalid signature'], 401);
        }

        $result = $this->paymentService->processWebhook($provider, $payload);

        return response()->json($result);
    }

    public function handleSupplier(string $provider, Request $request): JsonResponse
    {
        // Digiflazz webhook callback handling
        $payload = $request->all();
        Log::info('Supplier webhook received', ['provider' => $provider, 'payload' => $payload]);

        return response()->json(['status' => 'ok']);
    }
}
