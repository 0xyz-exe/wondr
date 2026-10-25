<?php

namespace App\Services;

use App\Models\Product;

class PricingService
{
    /**
     * Compute selling price with markup (all integer Rupiah).
     * ponytail: simple flat+pct markup; add tiered campaign discounts when promotional module expands.
     */
    public function calculateSellingPrice(int $basePrice, int $flatMarkup = 0, float $pctMarkup = 0.0): int
    {
        $markup = $flatMarkup + (int) round($basePrice * ($pctMarkup / 100));
        return max($basePrice, $basePrice + $markup);
    }

    /**
     * Compute order total including payment channel fee.
     */
    public function calculateOrderTotal(Product $product, string $paymentMethod): array
    {
        $amount = (int) $product->selling_price;
        $fee = $this->getPaymentFee($paymentMethod, $amount);

        return [
            'amount' => $amount,
            'fee' => $fee,
            'total' => $amount + $fee,
        ];
    }

    public function getPaymentFee(string $method, int $amount): int
    {
        return match ($method) {
            'qris' => (int) round($amount * 0.007), // 0.7% MDR standard BI
            'bca_va', 'bni_va', 'bri_va', 'mandiri_va' => 2500, // Flat IDR 2,500 VA fee
            'gopay', 'ovo', 'dana', 'shopeepay' => (int) round($amount * 0.015), // 1.5% e-wallet
            'sandbox' => 0,
            default => 1000,
        };
    }
}
