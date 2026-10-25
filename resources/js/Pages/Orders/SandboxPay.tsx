import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { QrCode, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface Props {
    order: {
        public_reference: string;
        total_amount: number;
        payment_method: string;
        product_name: string;
    };
}

export default function SandboxPay({ order }: Props) {
    const { post, processing } = useForm();

    const handleConfirm = () => {
        post(`/orders/${order.public_reference}/sandbox-confirm`);
    };

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <AppLayout>
            <Head title={`Simulator Pembayaran #${order.public_reference}`} />

            <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                        <QrCode className="w-8 h-8" />
                    </div>

                    <div>
                        <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
                            WONDR Sandbox Payment Gateway
                        </span>
                        <h1 className="text-xl sm:text-2xl font-black text-white mt-3">Simulasi Pembayaran Tagihan</h1>
                        <p className="text-xs text-slate-400 mt-1">Lingkungan pengujian transaksi aman tanpa uang riil</p>
                    </div>

                    {/* QR Mockup */}
                    <div className="bg-white p-6 rounded-2xl inline-block shadow-inner mx-auto">
                        <div className="w-44 h-44 bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-3 text-slate-700">
                            <QrCode className="w-24 h-24 text-slate-800 mb-2" />
                            <span className="text-[10px] font-mono font-bold">QRIS SIMULATOR</span>
                            <span className="text-[9px] text-slate-500">NMID: ID102000000001</span>
                        </div>
                    </div>

                    <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-xs space-y-2">
                        <div className="flex justify-between text-slate-400">
                            <span>Kode Tagihan:</span>
                            <span className="font-mono font-bold text-white">#{order.public_reference}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                            <span>Item Top-Up:</span>
                            <span className="font-semibold text-white">{order.product_name}</span>
                        </div>
                        <div className="border-t border-slate-800 pt-2 flex justify-between text-sm">
                            <span className="font-bold text-white">Nominal Pembayaran:</span>
                            <span className="font-black text-amber-400 text-base">{formatRupiah(order.total_amount)}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleConfirm}
                        disabled={processing}
                        className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>{processing ? 'Menyelesaikan Simulasi...' : 'Bayar Sekarang (Simulasi Berhasil)'}</span>
                    </button>

                    <div className="pt-2">
                        <Link
                            href={`/orders/${order.public_reference}`}
                            className="text-xs text-slate-400 hover:text-white transition flex items-center justify-center gap-1.5"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Batal dan kembali ke rincian pesanan
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
