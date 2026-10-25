import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ShoppingBag, CheckCircle, Clock, AlertTriangle, TrendingUp, DollarSign, RefreshCw, ChevronRight } from 'lucide-react';

interface Props {
    metrics: {
        total_orders: number;
        paid_orders: number;
        completed_orders: number;
        pending_orders: number;
        uncertain_orders: number;
        gross_revenue: number;
        estimated_profit: number;
    };
    recent_orders: Array<{
        id: number;
        public_reference: string;
        customer_email: string;
        product_name: string;
        total_amount: number;
        payment_status: string;
        fulfillment_status: string;
        created_at: string;
        game: { name: string };
    }>;
}

export default function Dashboard({ metrics, recent_orders }: Props) {
    const { post, processing } = useForm();

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    const handleReconcile = (orderId: number) => {
        post(`/admin/orders/${orderId}/reconcile`);
    };

    return (
        <AppLayout>
            <Head title="Admin Dashboard - WONDR Operations" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                    <div>
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Admin Control Center</span>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Operasional & Metrik Transaksi</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/orders"
                            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition flex items-center gap-1.5"
                        >
                            <ShoppingBag className="w-3.5 h-3.5" /> Kelola Pesanan
                        </Link>
                        <Link
                            href="/admin/catalog"
                            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5"
                        >
                            Kelola Katalog & Harga
                        </Link>
                    </div>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                        <div className="flex items-center justify-between text-slate-400 text-xs">
                            <span>Total Pesanan</span>
                            <ShoppingBag className="w-4 h-4 text-indigo-400" />
                        </div>
                        <p className="text-2xl font-extrabold text-white">{metrics.total_orders}</p>
                        <p className="text-[11px] text-slate-500">{metrics.paid_orders} pesanan terbayar</p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                        <div className="flex items-center justify-between text-slate-400 text-xs">
                            <span>Sukses Terkirim</span>
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                        </div>
                        <p className="text-2xl font-extrabold text-emerald-400">{metrics.completed_orders}</p>
                        <p className="text-[11px] text-slate-500">Fulfillment selesai 100%</p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                        <div className="flex items-center justify-between text-slate-400 text-xs">
                            <span>Perlu Rekonsiliasi</span>
                            <AlertTriangle className="w-4 h-4 text-rose-400" />
                        </div>
                        <p className="text-2xl font-extrabold text-rose-400">{metrics.uncertain_orders}</p>
                        <p className="text-[11px] text-slate-500">Status belum pasti dari supplier</p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                        <div className="flex items-center justify-between text-slate-400 text-xs">
                            <span>Gross Revenue</span>
                            <DollarSign className="w-4 h-4 text-cyan-400" />
                        </div>
                        <p className="text-xl font-extrabold text-cyan-400">{formatRupiah(metrics.gross_revenue)}</p>
                        <p className="text-[11px] text-emerald-400 font-semibold">Estimasi Margin: {formatRupiah(metrics.estimated_profit)}</p>
                    </div>
                </div>

                {/* Recent Orders Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                    <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                        <h3 className="font-bold text-white text-base">10 Transaksi Terakhir</h3>
                        <Link href="/admin/orders" className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1">
                            Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-300">
                            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                                <tr>
                                    <th className="px-5 py-3">Referensi</th>
                                    <th className="px-5 py-3">Game & Produk</th>
                                    <th className="px-5 py-3">Total</th>
                                    <th className="px-5 py-3">Bayar</th>
                                    <th className="px-5 py-3">Fulfillment</th>
                                    <th className="px-5 py-3">Waktu</th>
                                    <th className="px-5 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 font-medium">
                                {recent_orders.map((o) => (
                                    <tr key={o.id} className="hover:bg-slate-800/40 transition">
                                        <td className="px-5 py-3.5 font-mono font-bold text-white">
                                            <Link href={`/orders/${o.public_reference}`} className="hover:text-indigo-400">
                                                #{o.public_reference}
                                            </Link>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="text-white font-semibold">{o.game.name}</div>
                                            <div className="text-[10px] text-slate-400">{o.product_name}</div>
                                        </td>
                                        <td className="px-5 py-3.5 font-bold text-cyan-400">{formatRupiah(o.total_amount)}</td>
                                        <td className="px-5 py-3.5">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                o.payment_status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                            }`}>
                                                {o.payment_status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                o.fulfillment_status === 'completed'
                                                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                                    : o.fulfillment_status === 'uncertain'
                                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                                    : 'bg-slate-800 text-slate-400'
                                            }`}>
                                                {o.fulfillment_status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-400 text-[11px]">{new Date(o.created_at).toLocaleTimeString('id-ID')}</td>
                                        <td className="px-5 py-3.5 text-right">
                                            {o.fulfillment_status === 'uncertain' && (
                                                <button
                                                    onClick={() => handleReconcile(o.id)}
                                                    disabled={processing}
                                                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold shadow transition flex items-center gap-1 ml-auto"
                                                >
                                                    <RefreshCw className="w-3 h-3" /> Rekonsiliasi
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
