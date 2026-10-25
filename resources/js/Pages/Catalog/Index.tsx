import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Search, Zap, ShieldCheck, CreditCard, ChevronRight, Sparkles } from 'lucide-react';

interface Game {
    id: number;
    name: string;
    slug: string;
    publisher: string;
    category: string;
    thumbnail_url: string;
}

interface Props {
    games: Game[];
    categories: string[];
    filters: {
        search?: string;
        category?: string;
    };
}

export default function Index({ games, categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/', { search, category: selectedCategory }, { preserveState: true });
    };

    const handleCategoryClick = (cat: string) => {
        const next = selectedCategory === cat ? '' : cat;
        setSelectedCategory(next);
        router.get('/', { search, category: next }, { preserveState: true });
    };

    return (
        <AppLayout>
            <Head title="Top Up Game & Voucher Murah Terpercaya" />

            {/* Hero Banner */}
            <div className="relative overflow-hidden bg-gradient-to-b from-indigo-950/70 via-slate-900 to-slate-950 border-b border-slate-800 py-16 px-4 sm:px-6 lg:px-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

                <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                        <Sparkles className="w-3.5 h-3.5" /> Platform Top-Up Game Tercepat di Indonesia
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                        Top-Up Game Favoritmu <br className="hidden sm:inline" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-300">
                            Cepat, Aman & Otomatis 24 Jam
                        </span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed">
                        Pilih game, masukkan ID akun, bayar via QRIS atau Virtual Account bank, diamonds & koin langsung masuk hitungan detik!
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="max-w-xl mx-auto flex items-center relative">
                        <div className="absolute left-4 text-slate-400 pointer-events-none">
                            <Search className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari game (Mobile Legends, Free Fire, Valorant)..."
                            className="w-full pl-12 pr-28 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition shadow-xl"
                        />
                        <button
                            type="submit"
                            className="absolute right-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
                        >
                            Cari
                        </button>
                    </form>
                </div>
            </div>

            {/* Trust Badges */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur">
                    <div className="flex items-center gap-3 p-2">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <Zap className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Proses Otomatis</h4>
                            <p className="text-xs text-slate-400">Pengiriman instan via API resmi</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 border-t sm:border-t-0 sm:border-l border-slate-800">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">100% Legal & Terpercaya</h4>
                            <p className="text-xs text-slate-400">Jaminan akun aman tanpa resiko banned</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 border-t sm:border-t-0 sm:border-l border-slate-800">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Metode Terlengkap</h4>
                            <p className="text-xs text-slate-400">QRIS, BCA, BRI, Mandiri, E-Wallet</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Catalog Grid Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-extrabold text-white">Semua Game & Voucher</h2>
                        <p className="text-xs text-slate-400 mt-1">Pilih game favoritmu untuk mulai pengisian diamonds & voucher</p>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 max-w-full">
                        <button
                            onClick={() => handleCategoryClick('')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                                selectedCategory === ''
                                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                            }`}
                        >
                            Semua
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryClick(cat)}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                                    selectedCategory === cat
                                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Game Cards */}
                {games.length === 0 ? (
                    <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
                        <p className="text-slate-400 text-sm">Tidak ada game yang cocok dengan pencarian Anda.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {games.map((game) => (
                            <Link
                                key={game.id}
                                href={`/games/${game.slug}`}
                                className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-indigo-500/60 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col"
                            >
                                <div className="aspect-[4/3] w-full overflow-hidden relative">
                                    <img
                                        src={game.thumbnail_url}
                                        alt={game.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur text-[10px] font-semibold text-slate-300 border border-slate-700">
                                        {game.category}
                                    </span>
                                </div>

                                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{game.publisher}</p>
                                        <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition line-clamp-1">{game.name}</h3>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold pt-2 border-t border-slate-800/60">
                                        <span>Top Up Sekarang</span>
                                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
