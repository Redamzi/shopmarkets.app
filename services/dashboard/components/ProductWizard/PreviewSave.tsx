import React from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';
import { ClipboardCheck, Package, ShoppingBag, Image, Share2, AlertCircle } from 'lucide-react';

export const PreviewSave: React.FC = () => {
    const { productType, stepData } = useProductWizardStore();

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
                <div className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
                    <p className="font-bold mb-1">Fast fertig!</p>
                    <p>
                        Klicken Sie unten rechts auf <strong>"Speichern & Fertig"</strong> (oder den Haken), um das Produkt final zu erstellen.
                        Das Produkt wird anschließend in Ihrer Übersicht erscheinen und – falls gewählt – an die Marktplätze gesendet.
                    </p>
                </div>
            </div>
        </div>
    );
};
