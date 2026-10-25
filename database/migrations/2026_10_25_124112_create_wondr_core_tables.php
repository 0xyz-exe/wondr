<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('publisher');
            $table->string('category');
            $table->string('thumbnail_url');
            $table->string('banner_url')->nullable();
            $table->json('input_fields');
            $table->text('instruction')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('sku')->unique();
            $table->string('provider_code');
            $table->unsignedInteger('base_price');
            $table->unsignedInteger('selling_price');
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('public_reference', 64)->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('customer_email');
            $table->string('customer_phone')->nullable();
            $table->foreignId('game_id')->constrained()->restrictOnDelete();
            $table->foreignId('product_id')->constrained()->restrictOnDelete();
            $table->string('product_name');
            $table->string('product_sku');
            $table->string('player_id');
            $table->string('server_id')->nullable();
            $table->unsignedInteger('amount');
            $table->unsignedInteger('admin_fee')->default(0);
            $table->unsignedInteger('total_amount');
            $table->string('payment_method');
            $table->string('payment_reference')->nullable()->index();
            $table->string('payment_status')->default('pending')->index();
            $table->string('fulfillment_status')->default('pending')->index();
            $table->string('fulfillment_reference')->nullable()->index();
            $table->string('fulfillment_sn')->nullable();
            $table->text('fulfillment_notes')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('provider');
            $table->string('provider_reference')->nullable()->index();
            $table->string('payment_type')->nullable();
            $table->unsignedInteger('amount');
            $table->string('status')->default('pending');
            $table->string('signature_key')->nullable();
            $table->json('raw_payload')->nullable();
            $table->timestamps();
        });

        Schema::create('fulfillment_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('supplier');
            $table->string('supplier_reference')->nullable()->index();
            $table->string('product_code');
            $table->string('target_account');
            $table->string('status')->default('pending');
            $table->string('sn')->nullable();
            $table->string('message')->nullable();
            $table->json('raw_response')->nullable();
            $table->unsignedSmallInteger('attempts')->default(1);
            $table->timestamps();
        });

        Schema::create('webhook_logs', function (Blueprint $table) {
            $table->id();
            $table->string('provider');
            $table->string('event_id')->nullable()->index();
            $table->string('event_type')->nullable();
            $table->json('payload');
            $table->string('status')->default('processed');
            $table->text('error_message')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('webhook_logs');
        Schema::dropIfExists('fulfillment_transactions');
        Schema::dropIfExists('payment_transactions');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('products');
        Schema::dropIfExists('games');
    }
};
