import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Search, RefreshCw, ArrowLeft, Filter } from 'lucide-react';

interface OrderItem {
    id: number;
    public_reference: string;
    customer_email: string;
    player_id: string;
    server_id: string | null;
    product_name: string;
    amount: number;
    admin_fee: number;
    total_amount: number;
    payment_status: string;
    fulfillment_status: string;
    fulfillment_sn: string | null;
    created_at: string;
    game: { name: string };
}

interface Props {
    orders: {
        data: OrderItem[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        status?: string;
        search?: string;
    };
}

export default function Orders({ orders, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const { post, processing } = useForm();

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/orders', { search, status }, { preserveState: true });
    };

    const handleReconcile = (orderId: number) => {
        post(`/admin/orders/${orderId}/reconcile`);
    };

    return (
        <AppLayout>
            <Head title="Kelola Pesanan - Admin WONDR" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Link href="/admin/dashboard" className="hover:text-white flex items-center gap-1">
                        <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
                    </Link>
                    <span>/</span>
                    <span className="text-white">Pesanan</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                    <div>
                        <h1 className="text-2xl font-black text-white">Daftar Transaksi Pesanan</h1>
                        <p className="text-xs text-slate-400 mt-1">Total {orders.total} transaksi tercatat di database</p>
                    </div>

                    {/* Filter form */}
                    <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari ref / email / ID..."
                                className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>

                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        >
                            <option value="">Semua Status</option>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="completed">Completed</option>
                            <option value="uncertain">Uncertain (Perlu Reconcile)</option>
                            <option value="failed">Failed</option>
                        </select>

                        <button
                            type="submit"
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                        >
                            Filter
                        </button>
                    </form>
                </div>

                {/* Orders Data Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-300">
                            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                                <tr>
                                    <th className="px-5 py-3">No. Referensi</th>
                                    <th className="px-5 py-3">Item Game</th>
                                    <th className="px-5 py-3">Player / Target</th>
                                    <th className="px-5 py-3">Total</th>
                                    <th className="px-5 py-3">Bayar</th>
                                    <th className="px-5 py-3">Fulfillment</th>
                                    <th className="px-5 py-3">SN / Serial</th>
                                    <th className="px-5 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 font-medium">
                                {orders.data.map((o) => (
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
                                        <td className="px-5 py-3.5 font-mono text-slate-200">
                                            {o.player_id} {o.server_id ? `(${o.server_id})` : ''}
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
                                        <td className="px-5 py-3.5 font-mono text-[10px] text-slate-400">{o.fulfillment_sn || '-'}</td>
                                        <td className="px-5 py-3.5 text-right">
                                            {o.fulfillment_status === 'uncertain' && (
                                                <button
                                                    onClick={() => handleReconcile(o.id)}
                                                    disabled={processing}
                                                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold shadow transition flex items-center gap-1 ml-auto"
                                                >
                                                    <RefreshCw className="w-3 h-3" /> Reconcile
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
