<?php

namespace App\Services;

use App\Models\FulfillmentTransaction;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FulfillmentService
{
    /**
     * Dispatch top-up fulfillment to configured supplier.
     * ponytail: sandbox + Digiflazz; extend with LapakGaming/UniPin adapters as supplier agreements expand.
     */
    public function fulfill(Order $order): array
    {
        // Enforce payment check before fulfillment
        if ($order->payment_status !== 'paid') {
            return ['status' => 'rejected', 'message' => 'Cannot fulfill unpaid order.'];
        }

        // Idempotency: prevent double fulfillment
        if ($order->fulfillment_status === 'completed') {
            return ['status' => 'already_completed', 'reference' => $order->fulfillment_reference];
        }

        $supplier = config('services.supplier.driver', 'sandbox');

        if ($supplier === 'digiflazz' && config('services.digiflazz.api_key')) {
            return $this->fulfillDigiflazz($order);
        }

        return $this->fulfillSandbox($order);
    }

    /**
     * Reconcile uncertain transaction with supplier endpoint.
     */
    public function reconcile(Order $order): array
    {
        if ($order->fulfillment_status !== 'uncertain' && $order->fulfillment_status !== 'processing') {
            return ['status' => 'noop', 'message' => 'Order is in definitive state.'];
        }

        $supplier = config('services.supplier.driver', 'sandbox');

        if ($supplier === 'digiflazz' && config('services.digiflazz.api_key')) {
            return $this->reconcileDigiflazz($order);
        }

        // Sandbox reconcile: transitions uncertain to completed safely
        return DB::transaction(function () use ($order) {
            $order->update([
                'fulfillment_status' => 'completed',
                'fulfillment_sn' => 'SN-REC-' . strtoupper(bin2hex(random_bytes(4))),
                'completed_at' => now(),
            ]);

            FulfillmentTransaction::create([
                'order_id' => $order->id,
                'supplier' => 'sandbox',
                'supplier_reference' => $order->fulfillment_reference,
                'product_code' => $order->product->provider_code,
                'target_account' => $this->formatTargetAccount($order),
                'status' => 'success',
                'message' => 'Reconciled successfully via sandbox check',
            ]);

            return ['status' => 'completed', 'order' => $order->public_reference];
        });
    }

    protected function fulfillSandbox(Order $order): array
    {
        return DB::transaction(function () use ($order) {
            $ref = 'SUP-SB-' . strtoupper(bin2hex(random_bytes(5)));
            $sn = 'VOUCH-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(4)));

            $order->update([
                'fulfillment_status' => 'completed',
                'fulfillment_reference' => $ref,
                'fulfillment_sn' => $sn,
                'fulfillment_notes' => 'Topup berhasil diproses melalui Sandbox Engine.',
                'completed_at' => now(),
            ]);

            FulfillmentTransaction::create([
                'order_id' => $order->id,
                'supplier' => 'sandbox',
                'supplier_reference' => $ref,
                'product_code' => $order->product->provider_code,
                'target_account' => $this->formatTargetAccount($order),
                'status' => 'success',
                'sn' => $sn,
                'message' => 'Topup berhasil dikirim ke akun game tujuan.',
                'raw_response' => ['status' => 'success', 'sn' => $sn],
            ]);

            return [
                'status' => 'completed',
                'reference' => $ref,
                'sn' => $sn,
            ];
        });
    }

    protected function fulfillDigiflazz(Order $order): array
    {
        $username = config('services.digiflazz.username');
        $apiKey = config('services.digiflazz.api_key');
        $refId = $order->public_reference;
        $sign = md5($username . $apiKey . $refId);

        $target = $this->formatTargetAccount($order);
        $payload = [
            'username' => $username,
            'buyer_sku_code' => $order->product->provider_code,
            'customer_no' => $target,
            'ref_id' => $refId,
            'sign' => $sign,
            'testing' => config('services.digiflazz.testing', true),
        ];

        try {
            $response = Http::timeout(20)->post('https://api.digiflazz.com/v1/transaction', $payload);

            if (! $response->successful()) {
                // Network timeout or non-200 does NOT mean failed; mark uncertain to prevent duplicate fulfillment
                $this->markUncertain($order, 'HTTP error ' . $response->status(), $response->json());
                return ['status' => 'uncertain', 'message' => 'Uncertain supplier status; queued for status inquiry.'];
            }

            $body = $response->json()['data'] ?? [];
            $digiStatus = strtolower($body['status'] ?? 'pending');
            $sn = $body['sn'] ?? null;
            $msg = $body['message'] ?? 'Status from Digiflazz: ' . $digiStatus;

            return DB::transaction(function () use ($order, $body, $digiStatus, $sn, $msg, $target) {
                if ($digiStatus === 'sukses') {
                    $order->update([
                        'fulfillment_status' => 'completed',
                        'fulfillment_reference' => $body['ref_id'] ?? $order->public_reference,
                        'fulfillment_sn' => $sn,
                        'fulfillment_notes' => $msg,
                        'completed_at' => now(),
                    ]);
                    $finalStatus = 'success';
                } elseif ($digiStatus === 'gagal') {
                    $order->update([
                        'fulfillment_status' => 'failed',
                        'fulfillment_notes' => $msg,
                    ]);
                    $finalStatus = 'failed';
                } else {
                    $order->update([
                        'fulfillment_status' => 'processing',
                        'fulfillment_notes' => $msg,
                    ]);
                    $finalStatus = 'pending';
                }

                FulfillmentTransaction::create([
                    'order_id' => $order->id,
                    'supplier' => 'digiflazz',
                    'supplier_reference' => $body['ref_id'] ?? $order->public_reference,
                    'product_code' => $order->product->provider_code,
                    'target_account' => $target,
                    'status' => $finalStatus,
                    'sn' => $sn,
                    'message' => $msg,
                    'raw_response' => $body,
                ]);

                return ['status' => $finalStatus, 'message' => $msg, 'sn' => $sn];
            });
        } catch (\Throwable $e) {
            Log::error('Digiflazz call exception: ' . $e->getMessage(), ['order' => $order->id]);
            $this->markUncertain($order, 'Exception: ' . $e->getMessage(), []);
            return ['status' => 'uncertain', 'message' => 'Connection timed out. Marked uncertain to prevent double charging.'];
        }
    }

    protected function reconcileDigiflazz(Order $order): array
    {
        $username = config('services.digiflazz.username');
        $apiKey = config('services.digiflazz.api_key');
        $refId = $order->public_reference;
        $sign = md5($username . $apiKey . $refId);

        $payload = [
            'username' => $username,
            'buyer_sku_code' => $order->product->provider_code,
            'customer_no' => $this->formatTargetAccount($order),
            'ref_id' => $refId,
            'sign' => $sign,
        ];

        $response = Http::timeout(15)->post('https://api.digiflazz.com/v1/transaction', $payload);
        if (! $response->successful()) {
            return ['status' => 'uncertain', 'message' => 'Supplier inquiry failed.'];
        }

        $body = $response->json()['data'] ?? [];
        $status = strtolower($body['status'] ?? 'pending');

        if ($status === 'sukses') {
            $order->update([
                'fulfillment_status' => 'completed',
                'fulfillment_sn' => $body['sn'] ?? null,
                'completed_at' => now(),
            ]);
            return ['status' => 'completed', 'order' => $order->public_reference];
        } elseif ($status === 'gagal') {
            $order->update([
                'fulfillment_status' => 'failed',
                'fulfillment_notes' => $body['message'] ?? 'Dibatalkan supplier',
            ]);
            return ['status' => 'failed', 'order' => $order->public_reference];
        }

        return ['status' => 'processing', 'order' => $order->public_reference];
    }

    protected function markUncertain(Order $order, string $reason, array $raw): void
    {
        $order->update([
            'fulfillment_status' => 'uncertain',
            'fulfillment_notes' => 'Status tidak pasti: ' . $reason . '. Menunggu rekonsiliasi.',
        ]);

        FulfillmentTransaction::create([
            'order_id' => $order->id,
            'supplier' => 'digiflazz',
            'product_code' => $order->product->provider_code,
            'target_account' => $this->formatTargetAccount($order),
            'status' => 'uncertain',
            'message' => $reason,
            'raw_response' => $raw,
        ]);
    }

    protected function formatTargetAccount(Order $order): string
    {
        return $order->server_id ? "{$order->player_id}{$order->server_id}" : $order->player_id;
    }
}
