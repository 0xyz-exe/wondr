import React, { ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Gamepad2, ShieldCheck, Zap, Search, Clock, User, LogOut } from 'lucide-react';

interface Props {
    children: ReactNode;
}

export default function AppLayout({ children }: Props) {
    const { auth } = usePage().props as any;
    const user = auth?.user;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
            {/* Top Navigation */}
            <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition">
                                W
                            </div>
                            <div className="flex flex-col">
                                <span className="font-extrabold text-xl tracking-wider text-white">WONDR</span>
                                <span className="text-[10px] tracking-widest text-cyan-400 uppercase font-semibold -mt-1">Digital Top-Up</span>
                            </div>
                        </Link>

                        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
                            <Link href="/" className="hover:text-cyan-400 transition flex items-center gap-1.5">
                                <Gamepad2 className="w-4 h-4" /> Katalog Game
                            </Link>
                            {user?.is_admin && (
                                <Link href="/admin/dashboard" className="text-amber-400 hover:text-amber-300 transition flex items-center gap-1.5 font-semibold">
                                    <ShieldCheck className="w-4 h-4" /> Admin Console
                                </Link>
                            )}
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-slate-300 hidden sm:inline">
                                    {user.name}
                                </span>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1"
                                >
                                    <LogOut className="w-3.5 h-3.5" /> Keluar
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/login"
                                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition"
                                >
                                    Daftar
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 border-t border-slate-800 py-10 mt-16 text-slate-400 text-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-base">
                                W
                            </div>
                            <span className="font-bold text-lg text-white">WONDR</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Platform top-up game & voucher digital terpercaya di Indonesia. Pengiriman instan otomatis 24/7 dan pembayaran resmi berlisensi.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Metode Pembayaran</h4>
                        <div className="flex flex-wrap gap-2 text-xs">
                            <span className="bg-slate-800 px-2.5 py-1 rounded border border-slate-700">QRIS</span>
                            <span className="bg-slate-800 px-2.5 py-1 rounded border border-slate-700">BCA VA</span>
                            <span className="bg-slate-800 px-2.5 py-1 rounded border border-slate-700">Mandiri VA</span>
                            <span className="bg-slate-800 px-2.5 py-1 rounded border border-slate-700">GoPay</span>
                            <span className="bg-slate-800 px-2.5 py-1 rounded border border-slate-700">DANA</span>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Keamanan & Garansi</h4>
                        <ul className="text-xs space-y-2 text-slate-400">
                            <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Transaksi Enkripsi SSL</li>
                            <li className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400" /> Otomasi Supplier Resmi</li>
                            <li className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-cyan-400" /> Pelayanan 24 Jam Nonstop</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Bantuan Pelanggan</h4>
                        <p className="text-xs text-slate-400 mb-2">Mengalami kendala transaksi? Hubungi CS kami:</p>
                        <a href="mailto:support@wondr.id" className="text-xs text-cyan-400 hover:underline">support@wondr.id</a>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
                    <p>© 2026 WONDR Top-Up Indonesia. Seluruh hak cipta dilindungi undang-undang.</p>
                    <p className="mt-2 sm:mt-0">Semua nama produk dan merek dagang adalah hak milik dari pemiliknya masing-masing.</p>
                </div>
            </footer>
        </div>
    );
}
