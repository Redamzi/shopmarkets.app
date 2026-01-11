import React from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';
import { Truck, Box, Ruler } from 'lucide-react';

export const Shipping: React.FC = () => {
    const { stepData, setStepData } = useProductWizardStore();
    const data = stepData[8] || {}; // Step 8 is Shipping in new layout

    const updateData = (key: string, value: any) => {
        setStepData(8, { ...data, [key]: value });
    };

    return (
        <div className="max-w-4xl mx-auto p-2 md:p-6">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                    <Truck size={28} strokeWidth={1.5} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold font-serif-display text-slate-900 dark:text-white">Versand</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Gewicht und Abmessungen für den Versand definieren.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 space-y-8">

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex-1">
                        <label className="block text-lg font-bold text-slate-900 dark:text-white mb-1">Dies ist ein physisches Produkt</label>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Deaktivieren Sie dies für digitale Produkte oder Dienstleistungen.</p>
                    </div>
                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                        <input
                            type="checkbox"
                            className="absolute w-12 h-6 opacity-0 cursor-pointer"
                            checked={data.isPhysical !== false}
                            onChange={(e) => updateData('isPhysical', e.target.checked)}
                        />
                        <div className={`w-12 h-6 rounded-full shadow-inner transition-colors ${data.isPhysical !== false ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                        <div className={`absolute w-6 h-6 bg-white rounded-full shadow transform transition-transform ${data.isPhysical !== false ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                </div>

                {data.isPhysical !== false && (
                    <div className="space-y-8 animate-in slide-in-from-top-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="group">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                    <Box size={16} className="text-indigo-500" />
                                    Gewicht
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={data.weight || ''}
                                        onChange={(e) => updateData('weight', parseFloat(e.target.value))}
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-lg font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                        placeholder="0.0"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">kg</span>
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                    <Box size={16} className="text-indigo-500" />
                                    Volumengewicht (Optional)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={data.volumetricWeight || ''}
                                        onChange={(e) => updateData('volumetricWeight', parseFloat(e.target.value))}
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-lg font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                        placeholder="0.0"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">kg</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Ruler size={20} className="text-indigo-500" />
                                Abmessungen
                            </h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Länge</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={data.length || ''}
                                            onChange={(e) => updateData('length', parseFloat(e.target.value))}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:border-indigo-500 outline-none"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">cm</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Breite</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={data.width || ''}
                                            onChange={(e) => updateData('width', parseFloat(e.target.value))}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:border-indigo-500 outline-none"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">cm</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Höhe</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={data.height || ''}
                                            onChange={(e) => updateData('height', parseFloat(e.target.value))}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:border-indigo-500 outline-none"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">cm</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
