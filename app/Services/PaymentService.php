<?php

namespace App\Services;

use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Models\WebhookLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    public function __construct(
        protected FulfillmentService $fulfillmentService
    ) {}

    /**
     * Create payment request with provider.
     * ponytail: sandbox + midtrans Snap payload; add direct API bindings when multi-provider merchant accounts are verified.
     */
    public function createPayment(Order $order): array
    {
        $provider = config('services.payment.provider', 'sandbox');

        if ($provider === 'midtrans' && config('services.midtrans.server_key')) {
            return $this->createMidtransPayment($order);
        }

        // Sandbox payment generator
        $paymentRef = 'SB-' . strtoupper(bin2hex(random_bytes(6)));
        $order->update([
            'payment_reference' => $paymentRef,
            'expires_at' => now()->addHours(2),
        ]);

        PaymentTransaction::create([
            'order_id' => $order->id,
            'provider' => 'sandbox',
            'provider_reference' => $paymentRef,
            'payment_type' => $order->payment_method,
            'amount' => $order->total_amount,
            'status' => 'pending',
            'raw_payload' => ['created_at' => now()->toIso8601String()],
        ]);

        return [
            'provider' => 'sandbox',
            'payment_reference' => $paymentRef,
            'payment_url' => route('orders.pay.sandbox', ['order' => $order->public_reference]),
            'qr_code' => $order->payment_method === 'qris' ? '00020101021226610014ID.LINKAJA.WWW01189360091100222019740215' . $order->id : null,
            'va_number' => str_starts_with($order->payment_method, 'bca') ? '8277' . str_pad((string)$order->id, 8, '0', STR_PAD_LEFT) : null,
        ];
    }

    protected function createMidtransPayment(Order $order): array
    {
        $serverKey = config('services.midtrans.server_key');
        $isProduction = config('services.midtrans.is_production', false);
        $baseUrl = $isProduction ? 'https://app.midtrans.com/snap/v1/transactions' : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

        $payload = [
            'transaction_details' => [
                'order_id' => $order->public_reference,
                'gross_amount' => $order->total_amount,
            ],
            'customer_details' => [
                'email' => $order->customer_email,
                'phone' => $order->customer_phone ?? '',
            ],
            'item_details' => [
                [
                    'id' => $order->product_sku,
                    'price' => $order->amount,
                    'quantity' => 1,
                    'name' => substr($order->product_name, 0, 50),
                ],
                [
                    'id' => 'ADMIN_FEE',
                    'price' => $order->admin_fee,
                    'quantity' => 1,
                    'name' => 'Biaya Layanan',
                ],
            ],
        ];

        $response = Http::withBasicAuth($serverKey, '')
            ->timeout(15)
            ->post($baseUrl, $payload);

        if (! $response->successful()) {
            Log::error('Midtrans payment creation failed', ['order' => $order->id, 'response' => $response->body()]);
            throw new \RuntimeException('Gagal menghubungkan ke gateway pembayaran Midtrans.');
        }

        $body = $response->json();
        $token = $body['token'] ?? null;
        $redirectUrl = $body['redirect_url'] ?? null;

        $order->update([
            'payment_reference' => $token,
            'expires_at' => now()->addHours(2),
        ]);

        PaymentTransaction::create([
            'order_id' => $order->id,
            'provider' => 'midtrans',
            'provider_reference' => $token,
            'payment_type' => $order->payment_method,
            'amount' => $order->total_amount,
            'status' => 'pending',
            'raw_payload' => $body,
        ]);

        return [
            'provider' => 'midtrans',
            'payment_reference' => $token,
            'payment_url' => $redirectUrl,
            'token' => $token,
        ];
    }

    /**
     * Verify payment webhook signature.
     */
    public function verifyWebhookSignature(string $provider, array $payload, ?string $signature): bool
    {
        if ($provider === 'sandbox') {
            return true;
        }

        if ($provider === 'midtrans') {
            $orderId = $payload['order_id'] ?? '';
            $statusCode = $payload['status_code'] ?? '';
            $grossAmount = $payload['gross_amount'] ?? '';
            $serverKey = config('services.midtrans.server_key', '');

            $computed = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);
            return hash_equals($computed, (string) ($payload['signature_key'] ?? $signature));
        }

        return false;
    }

    /**
     * Process webhook idempotently and trigger automated fulfillment on paid status.
     */
    public function processWebhook(string $provider, array $payload): array
    {
        $reference = $payload['order_id'] ?? $payload['order_reference'] ?? null;
        if (! $reference) {
            return ['status' => 'ignored', 'message' => 'Missing order reference'];
        }

        return DB::transaction(function () use ($provider, $payload, $reference) {
            $order = Order::where('public_reference', $reference)
                ->lockForUpdate()
                ->first();

            if (! $order) {
                return ['status' => 'error', 'message' => 'Order not found'];
            }

            // Log raw webhook
            WebhookLog::create([
                'provider' => $provider,
                'event_id' => $payload['transaction_id'] ?? $payload['id'] ?? null,
                'event_type' => $payload['transaction_status'] ?? $payload['status'] ?? 'unknown',
                'payload' => $payload,
                'status' => 'processed',
            ]);

            $status = $this->normalizePaymentStatus($provider, $payload);

            PaymentTransaction::create([
                'order_id' => $order->id,
                'provider' => $provider,
                'provider_reference' => $payload['transaction_id'] ?? $order->payment_reference,
                'payment_type' => $payload['payment_type'] ?? $order->payment_method,
                'amount' => (int) ($payload['gross_amount'] ?? $order->total_amount),
                'status' => $status,
                'signature_key' => $payload['signature_key'] ?? null,
                'raw_payload' => $payload,
            ]);

            // Idempotency: do not re-process if already paid/completed
            if ($order->payment_status === 'paid') {
                return ['status' => 'already_paid', 'order' => $order->public_reference];
            }

            if ($status === 'paid') {
                $order->update([
                    'payment_status' => 'paid',
                    'paid_at' => now(),
                    'fulfillment_status' => 'processing',
                ]);

                // Trigger automatic fulfillment immediately after payment verified
                $this->fulfillmentService->fulfill($order);

                return ['status' => 'paid_and_fulfilled', 'order' => $order->public_reference];
            } elseif (in_array($status, ['failed', 'expired', 'denied'])) {
                $order->update([
                    'payment_status' => $status,
                    'fulfillment_status' => 'failed',
                ]);
            }

            return ['status' => $status, 'order' => $order->public_reference];
        });
    }

    protected function normalizePaymentStatus(string $provider, array $payload): string
    {
        if ($provider === 'sandbox') {
            return ($payload['status'] ?? 'paid') === 'paid' ? 'paid' : 'failed';
        }

        if ($provider === 'midtrans') {
            $txStatus = $payload['transaction_status'] ?? '';
            $fraudStatus = $payload['fraud_status'] ?? '';

            if ($txStatus === 'capture') {
                return $fraudStatus === 'challenge' ? 'challenge' : 'paid';
            }
            if ($txStatus === 'settlement') {
                return 'paid';
            }
            if (in_array($txStatus, ['deny', 'cancel'])) {
                return 'failed';
            }
            if ($txStatus === 'expire') {
                return 'expired';
            }
            return 'pending';
        }

        return 'pending';
    }
}
