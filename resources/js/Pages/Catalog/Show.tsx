import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ShieldCheck, Zap, Info, CheckCircle2, ArrowRight } from 'lucide-react';

interface InputField {
    name: string;
    label: string;
    type: string;
    placeholder: string;
    required: boolean;
    options?: Record<string, string>;
}

interface Product {
    id: number;
    name: string;
    sku: string;
    selling_price: number;
}

interface PaymentMethod {
    id: string;
    name: string;
    category: string;
    fee_type: string;
}

interface Game {
    id: number;
    name: string;
    slug: string;
    publisher: string;
    category: string;
    thumbnail_url: string;
    instruction: string | null;
    input_fields: InputField[];
}

interface Props {
    game: Game;
    products: Product[];
    paymentMethods: PaymentMethod[];
}

export default function Show({ game, products, paymentMethods }: Props) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] || null);
    const [selectedPayment, setSelectedPayment] = useState<string>('qris');

    const { data, setData, post, processing, errors } = useForm({
        game_id: game.id,
        product_id: products[0]?.id || 0,
        player_id: '',
        server_id: '',
        customer_email: '',
        customer_phone: '',
        payment_method: 'qris',
    });

    const handleSelectProduct = (prod: Product) => {
        setSelectedProduct(prod);
        setData('product_id', prod.id);
    };

    const handleSelectPayment = (methodId: string) => {
        setSelectedPayment(methodId);
        setData('payment_method', methodId);
    };

    const getEstimatedFee = (method: string, amount: number) => {
        switch (method) {
            case 'qris':
                return Math.round(amount * 0.007);
            case 'bca_va':
            case 'mandiri_va':
            case 'bni_va':
            case 'bri_va':
                return 2500;
            case 'gopay':
            case 'dana':
            case 'ovo':
                return Math.round(amount * 0.015);
            case 'sandbox':
                return 0;
            default:
                return 1000;
        }
    };

    const currentFee = selectedProduct ? getEstimatedFee(selectedPayment, selectedProduct.selling_price) : 0;
    const currentTotal = selectedProduct ? selectedProduct.selling_price + currentFee : 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/orders');
    };

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <AppLayout>
            <Head title={`Top Up ${game.name} Murah & Cepat`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Game Profile & Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sticky top-24 shadow-xl">
                            <div className="aspect-video w-full rounded-2xl overflow-hidden mb-5 border border-slate-800">
                                <img
                                    src={game.thumbnail_url}
                                    alt={game.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                                {game.category}
                            </span>
                            <h1 className="text-2xl font-extrabold text-white mt-2">{game.name}</h1>
                            <p className="text-xs text-slate-400 mt-1 uppercase font-medium">{game.publisher}</p>

                            <div className="mt-6 border-t border-slate-800 pt-5 space-y-4 text-xs text-slate-300">
                                <div className="flex items-start gap-2.5">
                                    <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                    <span>Pengiriman otomatis 24 jam nonstop langsung ke akun Anda.</span>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                    <span>100% legal & aman via supplier berlisensi resmi.</span>
                                </div>
                            </div>

                            {game.instruction && (
                                <div className="mt-6 bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                                        <Info className="w-4 h-4 text-cyan-400" /> Panduan ID
                                    </div>
                                    <p className="leading-relaxed">{game.instruction}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Checkout Form (Steps 1 to 4) */}
                    <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
                        {/* Step 1: Input Account ID */}
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm text-white">
                                    1
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white">Masukkan Informasi Akun Game</h3>
                                    <p className="text-xs text-slate-400">Pastikan ID yang dimasukkan sesuai agar diamonds masuk tepat sasaran</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                        User / Player ID <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.player_id}
                                        onChange={(e) => setData('player_id', e.target.value)}
                                        placeholder="Contoh: 12345678"
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                    {errors.player_id && <p className="text-rose-400 text-xs mt-1">{errors.player_id}</p>}
                                </div>

                                {game.input_fields.some((f) => f.name === 'server_id') && (
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                            Zone / Server ID <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={data.server_id}
                                            onChange={(e) => setData('server_id', e.target.value)}
                                            placeholder="Contoh: 2024"
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        />
                                        {errors.server_id && <p className="text-rose-400 text-xs mt-1">{errors.server_id}</p>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Step 2: Choose Nominal */}
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm text-white">
                                    2
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white">Pilih Nominal Top-Up</h3>
                                    <p className="text-xs text-slate-400">Pilih paket item atau denominasi diamonds yang Anda inginkan</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                                {products.map((p) => {
                                    const isSelected = selectedProduct?.id === p.id;
                                    return (
                                        <button
                                            type="button"
                                            key={p.id}
                                            onClick={() => handleSelectProduct(p)}
                                            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 relative ${
                                                isSelected
                                                    ? 'bg-indigo-600/15 border-indigo-500 shadow-lg shadow-indigo-600/10'
                                                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                                            }`}
                                        >
                                            {isSelected && (
                                                <CheckCircle2 className="w-4 h-4 text-indigo-400 absolute top-3 right-3" />
                                            )}
                                            <span className="font-bold text-sm text-white">{p.name}</span>
                                            <span className="text-xs font-semibold text-cyan-400">
                                                {formatRupiah(p.selling_price)}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.product_id && <p className="text-rose-400 text-xs">{errors.product_id}</p>}
                        </div>

                        {/* Step 3: Choose Payment Method */}
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm text-white">
                                    3
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white">Pilih Metode Pembayaran</h3>
                                    <p className="text-xs text-slate-400">Pembayaran aman berlisensi resmi Bank Indonesia & penyedia berwenang</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                {paymentMethods.map((m) => {
                                    const isSelected = selectedPayment === m.id;
                                    const fee = selectedProduct ? getEstimatedFee(m.id, selectedProduct.selling_price) : 0;
                                    const totalWithFee = selectedProduct ? selectedProduct.selling_price + fee : 0;

                                    return (
                                        <button
                                            type="button"
                                            key={m.id}
                                            onClick={() => handleSelectPayment(m.id)}
                                            className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                                                isSelected
                                                    ? 'bg-indigo-600/15 border-indigo-500 shadow-lg shadow-indigo-600/10'
                                                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                                            }`}
                                        >
                                            <div className="space-y-0.5">
                                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{m.category}</span>
                                                <h4 className="text-xs font-bold text-white">{m.name}</h4>
                                                <p className="text-[10px] text-slate-400">Biaya: {m.fee_type}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-extrabold text-cyan-400">
                                                    {formatRupiah(totalWithFee)}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Step 4: Contact & Checkout */}
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm text-white">
                                    4
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white">Konfirmasi & Pembayaran</h3>
                                    <p className="text-xs text-slate-400">Masukkan email untuk menerima invoice transaksi & serial voucher</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                        Email Penerima Bukti <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={data.customer_email}
                                        onChange={(e) => setData('customer_email', e.target.value)}
                                        placeholder="nama@email.com"
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                    {errors.customer_email && <p className="text-rose-400 text-xs mt-1">{errors.customer_email}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                        No. WhatsApp (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.customer_phone}
                                        onChange={(e) => setData('customer_phone', e.target.value)}
                                        placeholder="08123456789"
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Summary Box */}
                            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2 text-xs">
                                <div className="flex justify-between text-slate-400">
                                    <span>Item Pesanan:</span>
                                    <span className="text-white font-semibold">{game.name} - {selectedProduct?.name}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Harga Produk:</span>
                                    <span className="text-white font-semibold">{formatRupiah(selectedProduct?.selling_price || 0)}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Biaya Layanan:</span>
                                    <span className="text-white font-semibold">{formatRupiah(currentFee)}</span>
                                </div>
                                <div className="border-t border-slate-800 pt-2 flex justify-between text-sm">
                                    <span className="font-bold text-white">Total Bayar:</span>
                                    <span className="font-extrabold text-cyan-400 text-base">{formatRupiah(currentTotal)}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing || !selectedProduct}
                                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                                <span>{processing ? 'Memproses Pesanan...' : 'Beli Sekarang'}</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
