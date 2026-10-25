<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WebhookController;
use Illuminate\Support\Facades\Route;

// Public Catalog & Commerce
Route::get('/', [CatalogController::class, 'index'])->name('catalog.index');
Route::get('/games/{game:slug}', [CatalogController::class, 'show'])->name('catalog.show');

// Orders & Checkout
Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
Route::get('/orders/{reference}', [OrderController::class, 'show'])->name('orders.show');
Route::get('/orders/{order}/sandbox-pay', [OrderController::class, 'paySandbox'])->name('orders.pay.sandbox');
Route::post('/orders/{order}/sandbox-confirm', [OrderController::class, 'confirmSandbox'])->name('orders.confirm.sandbox');

// Webhook Endpoints
Route::post('/api/payment/webhooks/{provider}', [WebhookController::class, 'handlePayment'])->name('webhooks.payment');
Route::post('/api/supplier/webhooks/{provider}', [WebhookController::class, 'handleSupplier'])->name('webhooks.supplier');

// Authenticated Routes
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        if (request()->user()->is_admin) {
            return redirect()->route('admin.dashboard');
        }
        return redirect()->route('catalog.index');
    })->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Admin Operations
    Route::middleware('admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
        Route::get('/orders', [AdminController::class, 'orders'])->name('orders');
        Route::post('/orders/{order}/reconcile', [AdminController::class, 'reconcile'])->name('orders.reconcile');
        Route::get('/catalog', [AdminController::class, 'catalog'])->name('catalog');
        Route::patch('/products/{product}/price', [AdminController::class, 'updateProductPrice'])->name('products.price');
    });
});

require __DIR__.'/auth.php';
