import React from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';
import { Truck } from 'lucide-react';

export const Shipping: React.FC = () => {
    const { stepData, setStepData } = useProductWizardStore();
    const data = stepData[8] || {}; // Step 8 is Shipping in new layout

    const updateData = (key: string, value: any) => {
        setStepData(8, { ...data, [key]: value });
    };

    return (
        <div className="max-w-4xl mx-auto p-2 md:p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                    <Truck size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold font-serif-display text-slate-900">Versand</h2>
                    <p className="text-gray-500 text-sm">Gewicht und Abmessungen für den Versandversand definieren.</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Dies ist ein physisches Produkt</label>
                        <p className="text-xs text-slate-500">Deaktivieren Sie dies für digitale Produkte oder Dienstleistungen.</p>
                    </div>
                    <input
                        type="checkbox"
                        checked={data.isPhysical !== false}
                        onChange={(e) => updateData('isPhysical', e.target.checked)}
                        className="w-6 h-6 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                </div>

                {data.isPhysical !== false && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Gewicht</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={data.weight || ''}
                                        onChange={(e) => updateData('weight', parseFloat(e.target.value))}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="0.0"
                                    />
                                    <span className="absolute right-3 top-2 text-slate-400 text-sm">kg</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Volumengewicht (Optional)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={data.volumetricWeight || ''}
                                        onChange={(e) => updateData('volumetricWeight', parseFloat(e.target.value))}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="0.0"
                                    />
                                    <span className="absolute right-3 top-2 text-slate-400 text-sm">kg</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-sm text-slate-900 mb-4">Abmessungen</h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Länge</label>
                                    <input
                                        type="number"
                                        value={data.length || ''}
                                        onChange={(e) => updateData('length', parseFloat(e.target.value))}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Breite</label>
                                    <input
                                        type="number"
                                        value={data.width || ''}
                                        onChange={(e) => updateData('width', parseFloat(e.target.value))}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Höhe</label>
                                    <input
                                        type="number"
                                        value={data.height || ''}
                                        onChange={(e) => updateData('height', parseFloat(e.target.value))}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
