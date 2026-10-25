import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { CheckCircle2, Clock, AlertTriangle, ShieldCheck, Zap, ArrowLeft, RefreshCw, QrCode } from 'lucide-react';

interface OrderData {
    reference: string;
    game_name: string;
    game_thumbnail: string;
    product_name: string;
    player_id_masked: string;
    server_id: string | null;
    amount: number;
    admin_fee: number;
    total_amount: number;
    payment_method: string;
    payment_reference: string | null;
    payment_status: 'pending' | 'paid' | 'failed' | 'expired';
    fulfillment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'uncertain' | 'manual_review';
    fulfillment_sn: string | null;
    fulfillment_notes: string | null;
    created_at: string;
    expires_at: string | null;
    paid_at: string | null;
    completed_at: string | null;
}

interface Props {
    order: OrderData;
    sandbox_pay_url: string;
}

export default function Show({ order, sandbox_pay_url }: Props) {
    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    const isPaid = order.payment_status === 'paid';
    const isCompleted = order.fulfillment_status === 'completed';

    return (
        <AppLayout>
            <Head title={`Status Pesanan #${order.reference}`} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-6">
                    <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition">
                        <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Beranda
                    </Link>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                    {/* Header Banner */}
                    <div className="bg-gradient-to-r from-slate-950 via-indigo-950/60 to-slate-950 p-6 sm:p-8 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Detail Transaksi</span>
                            <h1 className="text-xl sm:text-2xl font-black text-white mt-1">#{order.reference}</h1>
                            <p className="text-xs text-slate-400 mt-1">Dibuat pada: {new Date(order.created_at).toLocaleString('id-ID')}</p>
                        </div>

                        {/* Status Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                                isPaid
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            }`}>
                                {isPaid ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                Pembayaran: {order.payment_status.toUpperCase()}
                            </span>

                            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                                isCompleted
                                    ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                                    : order.fulfillment_status === 'uncertain'
                                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                    : 'bg-slate-800 border-slate-700 text-slate-300'
                            }`}>
                                <Zap className="w-4 h-4" />
                                Top-Up: {order.fulfillment_status.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8 space-y-8">
                        {/* Completed Success Callout */}
                        {isCompleted && (
                            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-5 text-emerald-200 space-y-2">
                                <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                                    <CheckCircle2 className="w-5 h-5" /> Top-Up Berhasil Dikirimkan!
                                </div>
                                <p className="text-xs text-emerald-300 leading-relaxed">
                                    Diamonds / voucher pesanan Anda telah berhasil diisikan ke akun game tujuan.
                                </p>
                                {order.fulfillment_sn && (
                                    <div className="mt-3 bg-emerald-950/80 p-3 rounded-xl border border-emerald-800/40 text-xs">
                                        <span className="text-slate-400">Nomor Seri / Kode SN: </span>
                                        <span className="font-mono font-bold text-white tracking-wider">{order.fulfillment_sn}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Pending Payment Callout & Action */}
                        {!isPaid && (
                            <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-5 text-amber-200 space-y-4">
                                <div className="flex items-center gap-2 font-bold text-sm text-amber-400">
                                    <Clock className="w-5 h-5" /> Menunggu Konfirmasi Pembayaran
                                </div>
                                <p className="text-xs text-amber-300 leading-relaxed">
                                    Silakan selesaikan pembayaran sebesar <strong className="text-white font-extrabold">{formatRupiah(order.total_amount)}</strong> sebelum batas waktu berakhir.
                                </p>

                                {/* Developer Sandbox Payment Simulation Button */}
                                <div className="pt-2">
                                    <Link
                                        href={sandbox_pay_url}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition"
                                    >
                                        <QrCode className="w-4 h-4" /> Buka Halaman Simulasi Pembayaran Sandbox
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Order Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left: Product & Account Info */}
                            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 space-y-4 text-xs">
                                <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-2">Informasi Akun Game</h3>
                                <div className="flex items-center gap-3">
                                    <img
                                        src={order.game_thumbnail}
                                        alt={order.game_name}
                                        className="w-12 h-12 rounded-xl object-cover border border-slate-800"
                                    />
                                    <div>
                                        <h4 className="font-bold text-white text-sm">{order.game_name}</h4>
                                        <p className="text-indigo-400 font-semibold">{order.product_name}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2 text-slate-300">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Target User ID:</span>
                                        <span className="font-mono font-bold text-white">{order.player_id_masked}</span>
                                    </div>
                                    {order.server_id && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Server / Zone ID:</span>
                                            <span className="font-mono font-bold text-white">{order.server_id}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Metode Bayar:</span>
                                        <span className="font-bold uppercase text-white">{order.payment_method}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Payment Breakdown */}
                            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 space-y-4 text-xs">
                                <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-2">Rincian Pembayaran</h3>
                                <div className="space-y-2.5 text-slate-300">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Harga Item:</span>
                                        <span className="font-semibold text-white">{formatRupiah(order.amount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Biaya Penanganan:</span>
                                        <span className="font-semibold text-white">{formatRupiah(order.admin_fee)}</span>
                                    </div>
                                    <div className="border-t border-slate-800 pt-2.5 flex justify-between text-sm">
                                        <span className="font-bold text-white">Total Tagihan:</span>
                                        <span className="font-black text-cyan-400 text-base">{formatRupiah(order.total_amount)}</span>
                                    </div>
                                </div>

                                {order.paid_at && (
                                    <div className="pt-2 text-[11px] text-emerald-400 flex items-center gap-1.5">
                                        <ShieldCheck className="w-3.5 h-3.5" /> Diverifikasi pada: {new Date(order.paid_at).toLocaleString('id-ID')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
