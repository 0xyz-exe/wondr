import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ArrowLeft, Save, Check } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    sku: string;
    provider_code: string;
    base_price: number;
    selling_price: number;
    is_active: boolean;
}

interface Game {
    id: number;
    name: string;
    publisher: string;
    all_products: Product[];
}

interface Props {
    games: Game[];
}

export default function Catalog({ games }: Props) {
    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <AppLayout>
            <Head title="Kelola Katalog & Harga - Admin WONDR" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Link href="/admin/dashboard" className="hover:text-white flex items-center gap-1">
                        <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
                    </Link>
                    <span>/</span>
                    <span className="text-white">Katalog & Harga</span>
                </div>

                <div className="border-b border-slate-800 pb-5">
                    <h1 className="text-2xl font-black text-white">Manajemen Harga & Denominasi Produk</h1>
                    <p className="text-xs text-slate-400 mt-1">Ubah harga jual (selling price) atau aktifkan/nonaktifkan produk</p>
                </div>

                <div className="space-y-8">
                    {games.map((game) => (
                        <div key={game.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                            <div className="p-5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-white text-base">{game.name}</h3>
                                    <p className="text-[11px] text-slate-400">{game.publisher}</p>
                                </div>
                                <span className="text-xs font-semibold text-indigo-400">
                                    {game.all_products.length} Item Tersedia
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs text-slate-300">
                                    <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                                        <tr>
                                            <th className="px-5 py-3">Item / Paket</th>
                                            <th className="px-5 py-3">SKU</th>
                                            <th className="px-5 py-3">Kode Provider</th>
                                            <th className="px-5 py-3">Modal (Base Price)</th>
                                            <th className="px-5 py-3">Harga Jual (Selling Price)</th>
                                            <th className="px-5 py-3">Margin Keuntungan</th>
                                            <th className="px-5 py-3 text-right">Update</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60">
                                        {game.all_products.map((p) => (
                                            <ProductPriceRow key={p.id} product={p} formatRupiah={formatRupiah} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}

function ProductPriceRow({ product, formatRupiah }: { product: Product; formatRupiah: (v: number) => string }) {
    const { data, setData, patch, processing, recentlySuccessful } = useForm({
        selling_price: product.selling_price,
        is_active: product.is_active,
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/admin/products/${product.id}/price`);
    };

    const margin = data.selling_price - product.base_price;

    return (
        <tr className="hover:bg-slate-800/30 transition">
            <td className="px-5 py-3.5 font-bold text-white">{product.name}</td>
            <td className="px-5 py-3.5 font-mono text-slate-400 text-[11px]">{product.sku}</td>
            <td className="px-5 py-3.5 font-mono text-indigo-400 text-[11px]">{product.provider_code}</td>
            <td className="px-5 py-3.5 text-slate-300 font-semibold">{formatRupiah(product.base_price)}</td>
            <td className="px-5 py-3.5">
                <input
                    type="number"
                    min={product.base_price}
                    value={data.selling_price}
                    onChange={(e) => setData('selling_price', parseInt(e.target.value) || product.base_price)}
                    className="w-28 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-white font-bold text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
            </td>
            <td className="px-5 py-3.5">
                <span className={`font-bold ${margin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    +{formatRupiah(margin)}
                </span>
            </td>
            <td className="px-5 py-3.5 text-right">
                <button
                    onClick={handleSave}
                    disabled={processing}
                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition inline-flex items-center gap-1 disabled:opacity-50"
                >
                    {recentlySuccessful ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Save className="w-3.5 h-3.5" />}
                    Simpan
                </button>
            </td>
        </tr>
    );
}
