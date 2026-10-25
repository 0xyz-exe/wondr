<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\Order;
use App\Models\Product;
use App\Services\PaymentService;
use App\Services\PricingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(
        protected PricingService $pricingService,
        protected PaymentService $paymentService
    ) {}

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'game_id' => 'required|exists:games,id',
            'product_id' => 'required|exists:products,id',
            'player_id' => 'required|string|max:50',
            'server_id' => 'nullable|string|max:50',
            'customer_email' => 'required|email|max:100',
            'customer_phone' => 'nullable|string|max:20',
            'payment_method' => 'required|string|max:50',
        ]);

        $game = Game::where('id', $validated['game_id'])->where('is_active', true)->firstOrFail();
        $product = Product::where('id', $validated['product_id'])
            ->where('game_id', $game->id)
            ->where('is_active', true)
            ->firstOrFail();

        // Calculate monetary snapshot securely on server
        $pricing = $this->pricingService->calculateOrderTotal($product, $validated['payment_method']);

        // Generate high-entropy reference: WNDR-YYYYMMDD-XXXXXX
        $ref = 'WNDR-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(3)));

        $order = DB::transaction(function () use ($validated, $game, $product, $pricing, $ref, $request) {
            $order = Order::create([
                'public_reference' => $ref,
                'user_id' => $request->user()?->id,
                'customer_email' => $validated['customer_email'],
                'customer_phone' => $validated['customer_phone'] ?? null,
                'game_id' => $game->id,
                'product_id' => $product->id,
                'product_name' => $product->name,
                'product_sku' => $product->sku,
                'player_id' => $validated['player_id'],
                'server_id' => $validated['server_id'] ?? null,
                'amount' => $pricing['amount'],
                'admin_fee' => $pricing['fee'],
                'total_amount' => $pricing['total'],
                'payment_method' => $validated['payment_method'],
                'payment_status' => 'pending',
                'fulfillment_status' => 'pending',
                'expires_at' => now()->addHours(2),
            ]);

            return $order;
        });

        // Initialize payment with provider
        $paymentData = $this->paymentService->createPayment($order);

        return redirect()->route('orders.show', ['reference' => $order->public_reference]);
    }

    public function show(string $reference): Response
    {
        $order = Order::with(['game', 'product'])
            ->where('public_reference', $reference)
            ->firstOrFail();

        return Inertia::render('Orders/Show', [
            'order' => [
                'reference' => $order->public_reference,
                'game_name' => $order->game->name,
                'game_thumbnail' => $order->game->thumbnail_url,
                'product_name' => $order->product_name,
                'player_id_masked' => $this->maskPlayerId($order->player_id),
                'server_id' => $order->server_id,
                'amount' => $order->amount,
                'admin_fee' => $order->admin_fee,
                'total_amount' => $order->total_amount,
                'payment_method' => $order->payment_method,
                'payment_reference' => $order->payment_reference,
                'payment_status' => $order->payment_status,
                'fulfillment_status' => $order->fulfillment_status,
                'fulfillment_sn' => $order->fulfillment_sn,
                'fulfillment_notes' => $order->fulfillment_notes,
                'created_at' => $order->created_at->toIso8601String(),
                'expires_at' => $order->expires_at?->toIso8601String(),
                'paid_at' => $order->paid_at?->toIso8601String(),
                'completed_at' => $order->completed_at?->toIso8601String(),
            ],
            'sandbox_pay_url' => route('orders.pay.sandbox', ['order' => $order->public_reference]),
        ]);
    }

    /**
     * Simulation page for sandbox payment.
     */
    public function paySandbox(string $reference): Response
    {
        $order = Order::with(['game', 'product'])
            ->where('public_reference', $reference)
            ->firstOrFail();

        return Inertia::render('Orders/SandboxPay', [
            'order' => $order,
        ]);
    }

    /**
     * Submit simulated payment in sandbox.
     */
    public function confirmSandbox(string $reference): RedirectResponse
    {
        $order = Order::where('public_reference', $reference)->firstOrFail();

        // Process webhook payload directly
        $this->paymentService->processWebhook('sandbox', [
            'order_id' => $order->public_reference,
            'status' => 'paid',
            'gross_amount' => $order->total_amount,
            'transaction_id' => 'TX-SB-' . bin2hex(random_bytes(4)),
        ]);

        return redirect()->route('orders.show', ['reference' => $order->public_reference])
            ->with('status', 'Pembayaran sandbox berhasil diverifikasi!');
    }

    protected function maskPlayerId(string $id): string
    {
        $len = strlen($id);
        if ($len <= 4) {
            return str_repeat('*', $len);
        }
        return substr($id, 0, 2) . str_repeat('*', $len - 4) . substr($id, -2);
    }
}
