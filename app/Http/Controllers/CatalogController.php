<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    public function index(Request $request): Response
    {
        $games = Game::query()
            ->where('is_active', true)
            ->when($request->search, function ($q, $search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('publisher', 'like', "%{$search}%");
            })
            ->when($request->category, function ($q, $category) {
                $q->where('category', $category);
            })
            ->orderBy('name')
            ->get();

        $categories = Game::where('is_active', true)
            ->distinct()
            ->pluck('category');

        return Inertia::render('Catalog/Index', [
            'games' => $games,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category']),
        ]);
    }

    public function show(Game $game): Response
    {
        abort_unless($game->is_active, 404, 'Game tidak aktif');

        $game->load(['products' => fn ($q) => $q->where('is_active', true)->orderBy('sort_order')]);

        $paymentMethods = [
            ['id' => 'qris', 'name' => 'QRIS (Semua E-Wallet & Mobile Banking)', 'category' => 'Instant QR', 'fee_type' => '0.7%'],
            ['id' => 'bca_va', 'name' => 'BCA Virtual Account', 'category' => 'Virtual Account', 'fee_type' => 'Rp 2.500'],
            ['id' => 'mandiri_va', 'name' => 'Mandiri Virtual Account', 'category' => 'Virtual Account', 'fee_type' => 'Rp 2.500'],
            ['id' => 'bni_va', 'name' => 'BNI Virtual Account', 'category' => 'Virtual Account', 'fee_type' => 'Rp 2.500'],
            ['id' => 'bri_va', 'name' => 'BRI Virtual Account', 'category' => 'Virtual Account', 'fee_type' => 'Rp 2.500'],
            ['id' => 'gopay', 'name' => 'GoPay', 'category' => 'E-Wallet', 'fee_type' => '1.5%'],
            ['id' => 'dana', 'name' => 'DANA', 'category' => 'E-Wallet', 'fee_type' => '1.5%'],
            ['id' => 'ovo', 'name' => 'OVO', 'category' => 'E-Wallet', 'fee_type' => '1.5%'],
            ['id' => 'sandbox', 'name' => 'Sandbox Test Payment (Simulasi Sukses)', 'category' => 'Developer Test', 'fee_type' => 'Gratis'],
        ];

        return Inertia::render('Catalog/Show', [
            'game' => $game,
            'products' => $game->products,
            'paymentMethods' => $paymentMethods,
        ]);
    }
}
