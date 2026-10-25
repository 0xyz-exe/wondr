<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\Order;
use App\Models\Product;
use App\Services\FulfillmentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function dashboard(): Response
    {
        $totalOrders = Order::count();
        $paidOrders = Order::where('payment_status', 'paid')->count();
        $completedOrders = Order::where('fulfillment_status', 'completed')->count();
        $pendingOrders = Order::where('payment_status', 'pending')->count();
        $uncertainOrders = Order::where('fulfillment_status', 'uncertain')->count();

        $grossRevenue = (int) Order::where('payment_status', 'paid')->sum('total_amount');
        
        // Calculate gross profit by joining products
        $completedOrderIds = Order::where('fulfillment_status', 'completed')->pluck('id');
        $baseCostSum = (int) Order::whereIn('orders.id', $completedOrderIds)
            ->join('products', 'orders.product_id', '=', 'products.id')
            ->sum('products.base_price');
        $completedAmountSum = (int) Order::whereIn('id', $completedOrderIds)->sum('amount');
        $estimatedProfit = max(0, $completedAmountSum - $baseCostSum);

        $recentOrders = Order::with(['game', 'product'])
            ->latest()
            ->limit(10)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'total_orders' => $totalOrders,
                'paid_orders' => $paidOrders,
                'completed_orders' => $completedOrders,
                'pending_orders' => $pendingOrders,
                'uncertain_orders' => $uncertainOrders,
                'gross_revenue' => $grossRevenue,
                'estimated_profit' => $estimatedProfit,
            ],
            'recent_orders' => $recentOrders,
        ]);
    }

    public function orders(Request $request): Response
    {
        $orders = Order::with(['game', 'product'])
            ->when($request->status, function ($q, $status) {
                $q->where('fulfillment_status', $status)->orWhere('payment_status', $status);
            })
            ->when($request->search, function ($q, $search) {
                $q->where('public_reference', 'like', "%{$search}%")
                  ->orWhere('player_id', 'like', "%{$search}%")
                  ->orWhere('customer_email', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Orders', [
            'orders' => $orders,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function reconcile(Order $order, FulfillmentService $fulfillmentService): RedirectResponse
    {
        $result = $fulfillmentService->reconcile($order);

        return back()->with('status', "Hasil rekonsiliasi [{$order->public_reference}]: " . ($result['message'] ?? $result['status']));
    }

    public function catalog(): Response
    {
        $games = Game::with(['allProducts'])->get();

        return Inertia::render('Admin/Catalog', [
            'games' => $games,
        ]);
    }

    public function updateProductPrice(Product $product, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'selling_price' => 'required|integer|min:' . $product->base_price,
            'is_active' => 'required|boolean',
        ]);

        $product->update($validated);

        return back()->with('status', "Harga {$product->name} berhasil diperbarui.");
    }
}
