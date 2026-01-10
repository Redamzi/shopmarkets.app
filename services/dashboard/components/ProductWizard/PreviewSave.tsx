import React from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';

export const PreviewSave: React.FC = () => {
    const { productType, stepData } = useProductWizardStore();

    // Correct Data Mapping for 13 Steps
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
            <h2 className="text-2xl font-bold mb-2 font-serif-display">Prüfung & Abschluss</h2>
            <p className="text-gray-600 mb-6">Bitte überprüfen Sie Ihre Eingaben vor dem Speichern.</p>

            <div className="space-y-6">
                <div className="border rounded-2xl p-6 bg-white shadow-sm">
                    <h3 className="font-bold text-lg mb-4 text-indigo-900">Produktinformationen</h3>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                        <div className="flex flex-col">
                            <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Titel</span>
                            <span className="font-medium text-slate-800 text-lg">{allData.title}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Produktart</span>
                            <span className="font-medium text-slate-800">{allData.product_type}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">SKU</span>
                            <span className="font-medium text-slate-800">{allData.sku}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Kategorie</span>
                            <span className="font-medium text-slate-800">{allData.category}</span>
                        </div>
                    </div>
                </div>

                <div className="border rounded-2xl p-6 bg-white shadow-sm">
                    <h3 className="font-bold text-lg mb-4 text-indigo-900">Preis & Lager</h3>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                        <div className="flex flex-col">
                            <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Preis (Netto)</span>
                            <span className="font-medium text-emerald-600 text-xl">€ {allData.price}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Verfügbarer Bestand</span>
                            <span className="font-medium text-slate-800">{allData.stock} Stück</span>
                        </div>
                    </div>
                </div>

                <div className="border rounded-2xl p-6 bg-white shadow-sm">
                    <h3 className="font-bold text-lg mb-4 text-indigo-900">Medien ({allData.images.length})</h3>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                        {allData.images.length > 0 ? (
                            allData.images.map((img: string, i: number) => (
                                <img key={i} src={img} alt={`Product ${i + 1}`} className="w-full aspect-square object-cover rounded-lg border border-slate-100" />
                            ))
                        ) : (
                            <span className="text-gray-400 italic">Keine Bilder hochgeladen</span>
                        )}
                    </div>
                </div>

                <div className="border rounded-2xl p-6 bg-white shadow-sm">
                    <h3 className="font-bold text-lg mb-4 text-indigo-900">Aktive Kanäle</h3>
                    <div className="flex flex-wrap gap-2">
                        {allData.channels.length > 0 ? (
                            allData.channels.map((channel: string) => (
                                <span key={channel} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-100">
                                    {channel}
                                </span>
                            ))
                        ) : (
                            <span className="text-gray-400 italic">Keine Kanäle ausgewählt</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm flex items-start gap-3">
                <span className="text-xl">💡</span>
                <p>
                    Klicken Sie unten rechts auf <strong>"Speichern & Fertig"</strong>, um das Produkt zu erstellen.
                    Es wird anschließend in Ihrer Produktübersicht erscheinen.
                </p>
            </div>
        </div>
    );
};
