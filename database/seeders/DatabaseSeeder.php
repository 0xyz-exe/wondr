<?php

namespace Database\Seeders;

use App\Models\Game;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Users
        User::firstOrCreate(
            ['email' => 'admin@wondr.id'],
            [
                'name' => 'WONDR Administrator',
                'password' => Hash::make('AdminWondr2026!'),
                'is_admin' => true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'gamer@wondr.id'],
            [
                'name' => 'Indo Gamer',
                'password' => Hash::make('GamerWondr2026!'),
                'is_admin' => false,
            ]
        );

        // Game 1: Mobile Legends
        $mlbb = Game::firstOrCreate(
            ['slug' => 'mobile-legends'],
            [
                'name' => 'Mobile Legends: Bang Bang',
                'publisher' => 'Moonton',
                'category' => 'MOBA',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
                'input_fields' => [
                    ['name' => 'player_id', 'label' => 'User ID', 'type' => 'text', 'placeholder' => 'Contoh: 12345678', 'required' => true],
                    ['name' => 'server_id', 'label' => 'Zone ID', 'type' => 'text', 'placeholder' => 'Contoh: 2024', 'required' => true],
                ],
                'instruction' => 'Untuk menemukan ID Anda, klik avatar di pojok kiri atas layar utama game. User ID tercantum di sebelah nickname Anda.',
                'is_active' => true,
            ]
        );

        $mlbbProducts = [
            ['name' => '86 Diamonds', 'sku' => 'ML-86', 'provider_code' => 'mlbb_86', 'base_price' => 19000, 'selling_price' => 20500, 'sort_order' => 1],
            ['name' => '172 Diamonds', 'sku' => 'ML-172', 'provider_code' => 'mlbb_172', 'base_price' => 38000, 'selling_price' => 41000, 'sort_order' => 2],
            ['name' => '257 Diamonds', 'sku' => 'ML-257', 'provider_code' => 'mlbb_257', 'base_price' => 56000, 'selling_price' => 61000, 'sort_order' => 3],
            ['name' => 'Weekly Diamond Pass', 'sku' => 'ML-WDP', 'provider_code' => 'mlbb_wdp', 'base_price' => 27000, 'selling_price' => 29500, 'sort_order' => 4],
            ['name' => '706 Diamonds', 'sku' => 'ML-706', 'provider_code' => 'mlbb_706', 'base_price' => 150000, 'selling_price' => 163000, 'sort_order' => 5],
        ];

        foreach ($mlbbProducts as $p) {
            Product::firstOrCreate(['sku' => $p['sku']], array_merge($p, ['game_id' => $mlbb->id]));
        }

        // Game 2: Free Fire
        $ff = Game::firstOrCreate(
            ['slug' => 'free-fire'],
            [
                'name' => 'Free Fire',
                'publisher' => 'Garena',
                'category' => 'Battle Royale',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80',
                'input_fields' => [
                    ['name' => 'player_id', 'label' => 'Player ID', 'type' => 'text', 'placeholder' => 'Contoh: 987654321', 'required' => true],
                ],
                'instruction' => 'Untuk menemukan Player ID, buka profil game di pojok kiri atas menu game.',
                'is_active' => true,
            ]
        );

        $ffProducts = [
            ['name' => '70 Diamonds', 'sku' => 'FF-70', 'provider_code' => 'ff_70', 'base_price' => 9000, 'selling_price' => 10000, 'sort_order' => 1],
            ['name' => '140 Diamonds', 'sku' => 'FF-140', 'provider_code' => 'ff_140', 'base_price' => 18000, 'selling_price' => 19800, 'sort_order' => 2],
            ['name' => '355 Diamonds', 'sku' => 'FF-355', 'provider_code' => 'ff_355', 'base_price' => 45000, 'selling_price' => 49500, 'sort_order' => 3],
            ['name' => '720 Diamonds', 'sku' => 'FF-720', 'provider_code' => 'ff_720', 'base_price' => 90000, 'selling_price' => 98500, 'sort_order' => 4],
        ];

        foreach ($ffProducts as $p) {
            Product::firstOrCreate(['sku' => $p['sku']], array_merge($p, ['game_id' => $ff->id]));
        }

        // Game 3: PUBG Mobile
        $pubg = Game::firstOrCreate(
            ['slug' => 'pubg-mobile'],
            [
                'name' => 'PUBG Mobile',
                'publisher' => 'Level Infinite / Tencent',
                'category' => 'Battle Royale',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=400&q=80',
                'input_fields' => [
                    ['name' => 'player_id', 'label' => 'Account ID', 'type' => 'text', 'placeholder' => 'Contoh: 5123456789', 'required' => true],
                ],
                'instruction' => 'Buka profil Anda di PUBG Mobile, nomor ID terdapat di samping ikon avatar Anda.',
                'is_active' => true,
            ]
        );

        $pubgProducts = [
            ['name' => '60 UC', 'sku' => 'PUBG-60', 'provider_code' => 'pubg_60', 'base_price' => 13500, 'selling_price' => 15000, 'sort_order' => 1],
            ['name' => '325 UC', 'sku' => 'PUBG-325', 'provider_code' => 'pubg_325', 'base_price' => 67000, 'selling_price' => 74000, 'sort_order' => 2],
            ['name' => '660 UC', 'sku' => 'PUBG-660', 'provider_code' => 'pubg_660', 'base_price' => 135000, 'selling_price' => 148000, 'sort_order' => 3],
        ];

        foreach ($pubgProducts as $p) {
            Product::firstOrCreate(['sku' => $p['sku']], array_merge($p, ['game_id' => $pubg->id]));
        }

        // Game 4: Genshin Impact
        $genshin = Game::firstOrCreate(
            ['slug' => 'genshin-impact'],
            [
                'name' => 'Genshin Impact',
                'publisher' => 'HoYoverse',
                'category' => 'RPG',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=400&q=80',
                'input_fields' => [
                    ['name' => 'player_id', 'label' => 'UID', 'type' => 'text', 'placeholder' => 'Contoh: 800123456', 'required' => true],
                    ['name' => 'server_id', 'label' => 'Server', 'type' => 'select', 'options' => ['os_asia' => 'Asia', 'os_usa' => 'America', 'os_euro' => 'Europe', 'os_cht' => 'TW, HK, MO'], 'required' => true],
                ],
                'instruction' => 'Buka menu Paimon di game, UID Anda terlihat di pojok kanan bawah layar.',
                'is_active' => true,
            ]
        );

        $genshinProducts = [
            ['name' => 'Blessing of the Welkin Moon', 'sku' => 'GI-WELKIN', 'provider_code' => 'gi_welkin', 'base_price' => 69000, 'selling_price' => 75000, 'sort_order' => 1],
            ['name' => '60 Genesis Crystals', 'sku' => 'GI-60', 'provider_code' => 'gi_60', 'base_price' => 14000, 'selling_price' => 15500, 'sort_order' => 2],
            ['name' => '300+30 Genesis Crystals', 'sku' => 'GI-330', 'provider_code' => 'gi_330', 'base_price' => 69000, 'selling_price' => 76000, 'sort_order' => 3],
        ];

        foreach ($genshinProducts as $p) {
            Product::firstOrCreate(['sku' => $p['sku']], array_merge($p, ['game_id' => $genshin->id]));
        }

        // Game 5: Valorant
        $valorant = Game::firstOrCreate(
            ['slug' => 'valorant'],
            [
                'name' => 'Valorant',
                'publisher' => 'Riot Games',
                'category' => 'FPS',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
                'input_fields' => [
                    ['name' => 'player_id', 'label' => 'Riot ID (Contoh: Player#NA1)', 'type' => 'text', 'placeholder' => 'Contoh: User#1234', 'required' => true],
                ],
                'instruction' => 'Riot ID terdiri dari Nickname dan Tagline (Contoh: Jett#IND).',
                'is_active' => true,
            ]
        );

        $valProducts = [
            ['name' => '475 Valorant Points', 'sku' => 'VAL-475', 'provider_code' => 'val_475', 'base_price' => 50000, 'selling_price' => 54000, 'sort_order' => 1],
            ['name' => '1000 Valorant Points', 'sku' => 'VAL-1000', 'provider_code' => 'val_1000', 'base_price' => 100000, 'selling_price' => 107500, 'sort_order' => 2],
        ];

        foreach ($valProducts as $p) {
            Product::firstOrCreate(['sku' => $p['sku']], array_merge($p, ['game_id' => $valorant->id]));
        }
    }
}
