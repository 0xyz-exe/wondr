<?php

namespace Tests\Feature;

use App\Models\Game;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\PaymentService;
use App\Services\PricingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class WondrCommerceTest extends TestCase
{
    use RefreshDatabase;

    protected Game $game;
    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->game = Game::create([
            'name' => 'Mobile Legends: Bang Bang',
            'slug' => 'mobile-legends',
            'publisher' => 'Moonton',
            'category' => 'MOBA',
            'thumbnail_url' => 'https://example.com/mlbb.jpg',
            'input_fields' => [
                ['name' => 'player_id', 'label' => 'User ID', 'required' => true],
                ['name' => 'server_id', 'label' => 'Zone ID', 'required' => true],
            ],
            'is_active' => true,
        ]);

        $this->product = Product::create([
            'game_id' => $this->game->id,
            'name' => '86 Diamonds',
            'sku' => 'ML-86',
            'provider_code' => 'mlbb_86',
            'base_price' => 19000,
            'selling_price' => 20500,
            'is_active' => true,
            'sort_order' => 1,
        ]);
    }

    public function test_homepage_and_catalog_render_successfully(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);

        $response = $this->get('/games/mobile-legends');
        $response->assertStatus(200);
    }

    public function test_pricing_service_calculates_integer_totals_with_payment_fees(): void
    {
        $pricing = app(PricingService::class)->calculateOrderTotal($this->product, 'qris');

        $this->assertSame(20500, $pricing['amount']);
        $this->assertSame((int) round(20500 * 0.007), $pricing['fee']);
        $this->assertSame(20500 + (int) round(20500 * 0.007), $pricing['total']);
    }

    public function test_order_creation_validates_and_stores_server_calculated_price(): void
    {
        $payload = [
            'game_id' => $this->game->id,
            'product_id' => $this->product->id,
            'player_id' => '12345678',
            'server_id' => '2024',
            'customer_email' => 'buyer@example.com',
            'payment_method' => 'qris',
        ];

        $response = $this->post('/orders', $payload);

        $order = Order::first();
        $this->assertNotNull($order);
        $this->assertSame('12345678', $order->player_id);
        $this->assertSame('2024', $order->server_id);
        $this->assertSame('buyer@example.com', $order->customer_email);
        $this->assertSame(20500, $order->amount);
        $this->assertSame('pending', $order->payment_status);
        $this->assertSame('pending', $order->fulfillment_status);

        $response->assertRedirect(route('orders.show', ['reference' => $order->public_reference]));
    }

    public function test_order_tracking_page_accessible_via_public_reference(): void
    {
        $order = Order::create([
            'public_reference' => 'WNDR-TEST-1234',
            'customer_email' => 'buyer@example.com',
            'game_id' => $this->game->id,
            'product_id' => $this->product->id,
            'product_name' => $this->product->name,
            'product_sku' => $this->product->sku,
            'player_id' => '12345678',
            'server_id' => '2024',
            'amount' => 20500,
            'admin_fee' => 144,
            'total_amount' => 20644,
            'payment_method' => 'qris',
            'payment_status' => 'pending',
            'fulfillment_status' => 'pending',
        ]);

        $response = $this->get('/orders/' . $order->public_reference);
        $response->assertStatus(200);
    }

    public function test_sandbox_payment_flow_transitions_order_and_triggers_fulfillment(): void
    {
        $order = Order::create([
            'public_reference' => 'WNDR-TEST-FLOW',
            'customer_email' => 'gamer@example.com',
            'game_id' => $this->game->id,
            'product_id' => $this->product->id,
            'product_name' => $this->product->name,
            'product_sku' => $this->product->sku,
            'player_id' => '998877',
            'server_id' => '1001',
            'amount' => 20500,
            'admin_fee' => 0,
            'total_amount' => 20500,
            'payment_method' => 'sandbox',
            'payment_status' => 'pending',
            'fulfillment_status' => 'pending',
        ]);

        // Submit sandbox payment confirmation
        $response = $this->post("/orders/{$order->public_reference}/sandbox-confirm");
        $response->assertRedirect(route('orders.show', ['reference' => $order->public_reference]));

        $order->refresh();
        $this->assertSame('paid', $order->payment_status);
        $this->assertNotNull($order->paid_at);
        $this->assertSame('completed', $order->fulfillment_status);
        $this->assertNotNull($order->fulfillment_sn);
        $this->assertNotNull($order->completed_at);
    }

    public function test_webhook_idempotency_prevents_duplicate_fulfillment(): void
    {
        $order = Order::create([
            'public_reference' => 'WNDR-TEST-DUP',
            'customer_email' => 'gamer@example.com',
            'game_id' => $this->game->id,
            'product_id' => $this->product->id,
            'product_name' => $this->product->name,
            'product_sku' => $this->product->sku,
            'player_id' => '998877',
            'amount' => 20500,
            'admin_fee' => 0,
            'total_amount' => 20500,
            'payment_method' => 'sandbox',
            'payment_status' => 'pending',
            'fulfillment_status' => 'pending',
        ]);

        $payload = [
            'order_id' => $order->public_reference,
            'status' => 'paid',
            'gross_amount' => 20500,
            'transaction_id' => 'TX-DUP-01',
        ];

        // First webhook delivery
        $res1 = $this->postJson('/api/payment/webhooks/sandbox', $payload);
        $res1->assertStatus(200);
        $this->assertSame('paid_and_fulfilled', $res1->json('status'));

        $order->refresh();
        $initialSn = $order->fulfillment_sn;

        // Second duplicate webhook delivery
        $res2 = $this->postJson('/api/payment/webhooks/sandbox', $payload);
        $res2->assertStatus(200);
        $this->assertSame('already_paid', $res2->json('status'));

        $order->refresh();
        $this->assertSame($initialSn, $order->fulfillment_sn);
    }

    public function test_midtrans_webhook_signature_verification_and_rejection(): void
    {
        config(['services.midtrans.server_key' => 'midtrans-secret-key-123']);

        $payload = [
            'order_id' => 'WNDR-TEST-MID',
            'status_code' => '200',
            'gross_amount' => '20500.00',
            'transaction_status' => 'settlement',
            'signature_key' => 'wrong-signature',
        ];

        // Should reject 401 with wrong signature
        $response = $this->postJson('/api/payment/webhooks/midtrans', $payload);
        $response->assertStatus(401);

        // Correct signature
        $validSignature = hash('sha512', 'WNDR-TEST-MID20020500.00midtrans-secret-key-123');
        $validPayload = array_merge($payload, ['signature_key' => $validSignature]);

        // Create order first
        Order::create([
            'public_reference' => 'WNDR-TEST-MID',
            'customer_email' => 'gamer@example.com',
            'game_id' => $this->game->id,
            'product_id' => $this->product->id,
            'product_name' => $this->product->name,
            'product_sku' => $this->product->sku,
            'player_id' => '998877',
            'amount' => 20500,
            'total_amount' => 20500,
            'payment_method' => 'qris',
            'payment_status' => 'pending',
            'fulfillment_status' => 'pending',
        ]);

        $response = $this->postJson('/api/payment/webhooks/midtrans', $validPayload);
        $response->assertStatus(200);
    }

    public function test_digiflazz_network_timeout_marks_uncertain_to_prevent_duplicate_topup(): void
    {
        config([
            'services.supplier.driver' => 'digiflazz',
            'services.digiflazz.username' => 'test_user',
            'services.digiflazz.api_key' => 'test_key',
        ]);

        $order = Order::create([
            'public_reference' => 'WNDR-TEST-DIGI-TIMEOUT',
            'customer_email' => 'gamer@example.com',
            'game_id' => $this->game->id,
            'product_id' => $this->product->id,
            'product_name' => $this->product->name,
            'product_sku' => $this->product->sku,
            'player_id' => '998877',
            'amount' => 20500,
            'total_amount' => 20500,
            'payment_method' => 'qris',
            'payment_status' => 'paid',
            'fulfillment_status' => 'pending',
        ]);

        // Simulate Digiflazz network timeout / connection error
        Http::fake([
            'https://api.digiflazz.com/*' => Http::response(null, 504),
        ]);

        $result = app(\App\Services\FulfillmentService::class)->fulfill($order);

        $this->assertSame('uncertain', $result['status']);

        $order->refresh();
        $this->assertSame('uncertain', $order->fulfillment_status);
        $this->assertNull($order->completed_at);
    }

    public function test_admin_authorization_protects_dashboard_and_operations(): void
    {
        // Unauthenticated access
        $this->get('/admin/dashboard')->assertRedirect('/login');

        // Customer user access
        $customer = User::create([
            'name' => 'Regular Customer',
            'email' => 'cust@example.com',
            'password' => bcrypt('password'),
            'is_admin' => false,
        ]);

        $this->actingAs($customer)->get('/admin/dashboard')->assertStatus(403);

        // Admin user access
        $admin = User::create([
            'name' => 'Admin Operator',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'is_admin' => true,
        ]);

        $this->actingAs($admin)->get('/admin/dashboard')->assertStatus(200);
        $this->actingAs($admin)->get('/admin/orders')->assertStatus(200);
        $this->actingAs($admin)->get('/admin/catalog')->assertStatus(200);

        // Admin price update
        $patchResponse = $this->actingAs($admin)->patch("/admin/products/{$this->product->id}/price", [
            'selling_price' => 22000,
            'is_active' => true,
        ]);
        $patchResponse->assertSessionHasNoErrors();

        $this->product->refresh();
        $this->assertSame(22000, $this->product->selling_price);
    }
}
