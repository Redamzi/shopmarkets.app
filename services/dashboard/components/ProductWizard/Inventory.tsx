import React from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';
import { Box } from 'lucide-react';

export const Inventory: React.FC = () => {
    const { stepData, setStepData } = useProductWizardStore();
    const data = stepData[7] || {}; // Step 7 is Inventory in new layout (Pricing is 6)
    // We can sync SKU with Step 4/PricingInventory if needed, but separate is safer for now.

    const updateData = (key: string, value: any) => {
        setStepData(7, { ...data, [key]: value });
    };

    return (
        <div className="max-w-4xl mx-auto p-2 md:p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                    <Box size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold font-serif-display text-slate-900">Lagerverwaltung</h2>
                    <p className="text-gray-500 text-sm">Bestandsverfolgung und Lagerorte verwalten.</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">SKU (Artikelnummer)</label>
                        <input
                            type="text"
                            value={data.sku || ''}
                            onChange={(e) => updateData('sku', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Eindeutige Artikelnummer"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Barcode (EAN/GTIN)</label>
                        <input
                            type="text"
                            value={data.barcode || ''}
                            onChange={(e) => updateData('barcode', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="ISBN, UPC, GTIN, etc."
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4 py-4 border-t border-b border-slate-100">
                    <input
                        type="checkbox"
                        id="track-quantity"
                        checked={data.trackQuantity !== false} // Default true
                        onChange={(e) => updateData('trackQuantity', e.target.checked)}
                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="track-quantity" className="block font-medium text-slate-900 cursor-pointer">Bestand verfolgen</label>
                </div>

                {data.trackQuantity !== false && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Verfügbarer Bestand</label>
                            <input
                                type="number"
                                value={data.quantity || ''}
                                onChange={(e) => updateData('quantity', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Warnen bei unter (Low Stock)</label>
                            <input
                                type="number"
                                value={data.lowStockThreshold || ''}
                                onChange={(e) => updateData('lowStockThreshold', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="z.B. 5"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
