import React from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';
import { ClipboardCheck, Package, ShoppingBag, Image, Share2, AlertCircle, Coins, Sparkles, TrendingUp } from 'lucide-react';

export const PreviewSave: React.FC = () => {
    const { productType, stepData, isAIUsed } = useProductWizardStore();

    // Correct Data Mapping based on recent refactors
    const allData = {
        title: stepData[2]?.title || stepData[1]?.title || 'Unbenanntes Produkt',
        product_type: productType,
        price: stepData[6]?.price || '0.00',
        stock: stepData[7]?.quantity || '0',
        sku: stepData[7]?.sku || '-',
        category: stepData[10]?.category || '-',
        images: stepData[3]?.images || [],
        channels: stepData[12]?.channels || []
    };

    // Credit Calculation
    const aiCost = isAIUsed ? 1.00 : 0;
    const channelCount = allData.channels.length;
    // Assumption: 0.30 per channel listing
    const channelCost = channelCount * 0.30;
    // Auto-Calc cost (if enabled in step 5)
    const isAutoCalc = stepData[5]?.autoCalc;
    const autoCalcCost = (isAutoCalc && channelCount > 0) ? (channelCount * 0.10) : 0;

    // Price Radar (Subscription reminder, not immediate cost usually, but let's list it if relevant or leave out for now)
    // The prompt says "5 Credits / Month". We won't add it to the "One-time" cost here unless logic dictates.

    const totalCredits = aiCost + channelCost + autoCalcCost;

    return (
        <div className="max-w-4xl mx-auto p-2 md:p-6">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
                    <ClipboardCheck size={28} strokeWidth={1.5} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold font-serif-display text-slate-900 dark:text-white">Prüfung & Abschluss</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Bitte überprüfen Sie Ihre Eingaben vor dem Speichern.</p>
                </div>
            </div>

            <div className="space-y-6">

                {/* Credit Cost Summary Card */}
                <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 p-8 rounded-[2rem] shadow-xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Coins size={24} className="text-yellow-400" />
                                Kosten-Übersicht
                            </h3>
                            <div className="text-right">
                                <span className="block text-sm text-indigo-200">Gesamtkosten</span>
                                <span className="text-3xl font-bold text-yellow-400">{totalCredits.toFixed(2)} Credits</span>
                            </div>
                        </div>

                        <div className="space-y-3 bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                            {aiCost > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="flex items-center gap-2 text-indigo-100"><Sparkles size={14} /> AI Magic Creator</span>
                                    <span className="font-mono font-bold">{aiCost.toFixed(2)}</span>
                                </div>
                            )}
                            {channelCount > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="flex items-center gap-2 text-indigo-100"><Share2 size={14} /> Kanallistung ({channelCount}x)</span>
                                    <span className="font-mono font-bold">{channelCost.toFixed(2)}</span>
                                </div>
                            )}
                            {autoCalcCost > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="flex items-center gap-2 text-indigo-100"><TrendingUp size={14} /> Gebühren-Auto-Calc ({channelCount}x)</span>
                                    <span className="font-mono font-bold">{autoCalcCost.toFixed(2)}</span>
                                </div>
                            )}
                            {totalCredits === 0 && (
                                <div className="text-center text-indigo-200 italic">Kostenlose Erstellung (Manuell)</div>
                            )}
                        </div>
                        <p className="mt-4 text-xs text-indigo-300">*Credits werden erst beim erfolgreichen Speichern abgezogen.</p>
                    </div>
                </div>

                {/* Product Info */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Package size={20} className="text-indigo-500" />
                        Produktinformationen
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                        <div>
                            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Titel</span>
                            <span className="font-bold text-slate-900 dark:text-white text-lg">{allData.title}</span>
                        </div>
                        <div>
                            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Produktart</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg inline-block capitalize">{allData.product_type}</span>
                        </div>
                        <div>
                            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">SKU</span>
                            <span className="font-mono text-slate-700 dark:text-slate-300">{allData.sku}</span>
                        </div>
                        <div>
                            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Kategorie</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">{allData.category}</span>
                        </div>
                    </div>
                </div>

                {/* Price & Stock */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <ShoppingBag size={20} className="text-indigo-500" />
                        Preis & Lager
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                        <div>
                            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Preis (Netto)</span>
                            <span className="font-bold text-emerald-600 text-3xl">€ {allData.price}</span>
                        </div>
                        <div>
                            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Verfügbarer Bestand</span>
                            <span className="font-bold text-slate-900 dark:text-white text-xl">{allData.stock} <span className="text-sm font-normal text-slate-500">Stück</span></span>
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Image size={20} className="text-indigo-500" />
                        Medien <span className="text-slate-400 text-sm font-normal ml-2">({allData.images.length})</span>
                    </h3>
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                        {allData.images.length > 0 ? (
                            allData.images.map((img: string, i: number) => (
                                <div key={i} className="aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm relative group">
                                    <img src={img} alt={`Product ${i + 1}`} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-8 text-center text-slate-400 italic bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                Keine Bilder hochgeladen
                            </div>
                        )}
                    </div>
                </div>

                {/* Channels */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Share2 size={20} className="text-indigo-500" />
                        Aktive Kanäle
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {allData.channels.length > 0 ? (
                            allData.channels.map((channel: string) => (
                                <span key={channel} className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-xl text-sm font-bold border border-indigo-100 dark:border-indigo-800 capitalize">
                                    {channel}
                                </span>
                            ))
                        ) : (
                            <span className="text-slate-400 italic">Keine Kanäle ausgewählt (Nur lokal)</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 p-6 bg-blue-50 dark:bg-slate-800 border-l-4 border-blue-500 dark:border-blue-400 rounded-r-xl flex items-start gap-4">
                <AlertCircle size={24} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed w-full">
                    <p className="font-bold mb-1">Fast fertig!</p>
                    <p className="mb-2">
                        Klicken Sie unten rechts auf <strong>"Produkt Speichern"</strong>, um das Produkt final zu erstellen.
                    </p>
                    {totalCredits > 0 && (
                        <p className="font-bold text-indigo-600 dark:text-indigo-400">
                            Hinweis: Es werden {totalCredits.toFixed(2)} Credits von Ihrem Konto abgezogen.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
