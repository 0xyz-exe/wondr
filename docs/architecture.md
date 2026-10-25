# WONDR Architecture Specification

## 1. Stack Decided
- **Backend Framework**: Laravel 13.38.0
- **Frontend Architecture**: Inertia.js + React 19 + TypeScript + Tailwind CSS
- **Data Persistence**: PostgreSQL 16 (dev/prod) / SQLite (local tests)
- **Queues & Caching**: Redis (asynchronous fulfillment jobs & distributed locking)
- **Payment Providers**: Midtrans (Production / Sandbox), Xendit (Ready scaffolding), Sandbox internal simulator
- **Fulfillment Suppliers**: Digiflazz (API v1 signature: `md5(username + apiKey + ref_id)`), Sandbox auto-fulfiller

## 2. Invariants & Security
- **Server-Side Pricing**: Client never submits `total_amount` or `price`. Price snapshots stored on `orders` at checkout.
- **Webhook Idempotency**: Status transitions verify current state before executing fulfillment. Duplicate webhooks return `already_paid`.
- **Conservative Timeout Policy**: Supplier HTTP timeouts or 5xx responses DO NOT trigger instant duplicate retries. Order transitions to `uncertain` status and requires status inquiry reconciliation.
- **ID Masking**: Customer account IDs are masked in public views (`1234****78`) to protect gamer privacy.
