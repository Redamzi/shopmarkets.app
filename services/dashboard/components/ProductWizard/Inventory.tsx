import React from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';
import { Box, ScanLine, AlertTriangle, Layers } from 'lucide-react';

export const Inventory: React.FC = () => {
    const { stepData, setStepData } = useProductWizardStore();
    const data = stepData[7] || {}; // Step 7 is Inventory

    const updateData = (key: string, value: any) => {
        setStepData(7, { ...data, [key]: value });
    };

    return (
        <div className="max-w-4xl mx-auto p-2 md:p-6">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                    <Box size={28} strokeWidth={1.5} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold font-serif-display text-slate-900 dark:text-white">Lagerverwaltung</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Bestandsverfolgung und Lagerorte verwalten.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                            <Layers size={16} className="text-indigo-500" />
                            SKU (Artikelnummer)
                        </label>
                        <input
                            type="text"
                            value={data.sku || ''}
                            onChange={(e) => updateData('sku', e.target.value)}
                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-lg font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                            placeholder="Eindeutige Artikelnummer"
                        />
                    </div>
                    <div className="group">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                            <ScanLine size={16} className="text-indigo-500" />
                            Barcode (EAN/GTIN)
                        </label>
                        <input
                            type="text"
                            value={data.barcode || ''}
                            onChange={(e) => updateData('barcode', e.target.value)}
                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-lg font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                            placeholder="ISBN, UPC, GTIN, etc."
                        />
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center text-indigo-500 shadow-sm">
                                <Box size={20} />
                            </div>
                            <div>
                                <label htmlFor="track-quantity" className="block text-lg font-bold text-slate-900 dark:text-white cursor-pointer">Bestand verfolgen</label>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Automatische Bestandsreduzierung bei Verkäufen.</p>
                            </div>
                        </div>

                        <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                            <input
                                type="checkbox"
                                id="track-quantity"
                                className="absolute w-12 h-6 opacity-0 cursor-pointer z-10"
                                checked={data.trackQuantity !== false}
                                onChange={(e) => updateData('trackQuantity', e.target.checked)}
                            />
                            <div className={`w-12 h-6 rounded-full shadow-inner transition-colors ${data.trackQuantity !== false ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                            <div className={`absolute left-0 top-0 w-6 h-6 bg-white rounded-full shadow transform transition-transform ${data.trackQuantity !== false ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                    </div>

                    {data.trackQuantity !== false && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-300">
                            <div className="group">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                    <Box size={16} className="text-indigo-500" />
                                    Verfügbarer Bestand
                                </label>
                                <input
                                    type="number"
                                    value={data.quantity || ''}
                                    onChange={(e) => updateData('quantity', parseInt(e.target.value))}
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-lg font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                    placeholder="0"
                                />
                            </div>
                            <div className="group">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                    <AlertTriangle size={16} className="text-amber-500" />
                                    Warnen bei unter (Low Stock)
                                </label>
                                <input
                                    type="number"
                                    value={data.lowStockThreshold || ''}
                                    onChange={(e) => updateData('lowStockThreshold', parseInt(e.target.value))}
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-lg font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                    placeholder="z.B. 5"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
