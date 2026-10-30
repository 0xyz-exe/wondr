<?php

namespace Database\Seeders;

use App\Models\Game;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        if (Order::count() > 0) {
            return;
        }

        $mlbb = Game::where('slug', 'mobile-legends')->first();
        $p1 = Product::where('sku', 'ML-86')->first();
        $p2 = Product::where('sku', 'ML-WDP')->first();
        $ff = Game::where('slug', 'free-fire')->first();
        $p3 = Product::where('sku', 'FF-355')->first();
        $val = Game::where('slug', 'valorant')->first();
        $p4 = Product::where('sku', 'VAL-475')->first();

        Order::create([
            'public_reference' => 'WNDR-20261030-981241',
            'customer_email' => 'andi.pratama@gmail.com',
            'game_id' => $mlbb->id,
            'product_id' => $p1->id,
            'product_name' => $p1->name,
            'product_sku' => $p1->sku,
            'player_id' => '84920194',
            'server_id' => '2109',
            'amount' => 20500,
            'admin_fee' => 144,
            'total_amount' => 20644,
            'payment_method' => 'qris',
            'payment_status' => 'paid',
            'fulfillment_status' => 'completed',
            'fulfillment_sn' => 'SN-MLBB-992019482-OK',
            'paid_at' => now()->subMinutes(15),
        ]);

        Order::create([
            'public_reference' => 'WNDR-20261030-472911',
            'customer_email' => 'budi.santoso@yahoo.com',
            'game_id' => $mlbb->id,
            'product_id' => $p2->id,
            'product_name' => $p2->name,
            'product_sku' => $p2->sku,
            'player_id' => '19284729',
            'server_id' => '2044',
            'amount' => 29500,
            'admin_fee' => 2500,
            'total_amount' => 32000,
            'payment_method' => 'bca_va',
            'payment_status' => 'paid',
            'fulfillment_status' => 'completed',
            'fulfillment_sn' => 'SN-WDP-8839201-OK',
            'paid_at' => now()->subHours(1),
        ]);

        Order::create([
            'public_reference' => 'WNDR-20261030-109284',
            'customer_email' => 'reza.gaming@gmail.com',
            'game_id' => $ff->id,
            'product_id' => $p3->id,
            'product_name' => $p3->name,
            'product_sku' => $p3->sku,
            'player_id' => '992018471',
            'amount' => 49500,
            'admin_fee' => 347,
            'total_amount' => 49847,
            'payment_method' => 'qris',
            'payment_status' => 'paid',
            'fulfillment_status' => 'completed',
            'fulfillment_sn' => 'SN-FF-0918237-OK',
            'paid_at' => now()->subHours(2),
        ]);

        Order::create([
            'public_reference' => 'WNDR-20261030-554109',
            'customer_email' => 'dimas.v@gmail.com',
            'game_id' => $val->id,
            'product_id' => $p4->id,
            'product_name' => $p4->name,
            'product_sku' => $p4->sku,
            'player_id' => 'DimasV#ID1',
            'amount' => 54000,
            'admin_fee' => 2500,
            'total_amount' => 56500,
            'payment_method' => 'mandiri_va',
            'payment_status' => 'pending',
            'fulfillment_status' => 'pending',
            'created_at' => now()->subMinutes(5),
        ]);

        Order::create([
            'public_reference' => 'WNDR-20261030-771920',
            'customer_email' => 'fauzan@outlook.com',
            'game_id' => $mlbb->id,
            'product_id' => $p1->id,
            'product_name' => $p1->name,
            'product_sku' => $p1->sku,
            'player_id' => '77391024',
            'server_id' => '2019',
            'amount' => 20500,
            'admin_fee' => 144,
            'total_amount' => 20644,
            'payment_method' => 'qris',
            'payment_status' => 'paid',
            'fulfillment_status' => 'uncertain',
            'paid_at' => now()->subMinutes(40),
        ]);
    }
}
