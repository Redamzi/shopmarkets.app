import React from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';
import { Tag, Factory, ShoppingBag, FolderTree } from 'lucide-react';

export const Organization: React.FC = () => {
    const { stepData, setStepData } = useProductWizardStore();
    const data = stepData[10] || {}; // Step 10 is Organization

    const updateData = (key: string, value: any) => {
        setStepData(10, { ...data, [key]: value });
    };

    return (
        <div className="max-w-4xl mx-auto p-2 md:p-6">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                    <Tag size={28} strokeWidth={1.5} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold font-serif-display text-slate-900 dark:text-white">Organisation</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Kategorisierung und Organisation Ihres Produkts.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 space-y-8">

                <div className="group">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                        <FolderTree size={16} className="text-indigo-500" />
                        Produktkategorie
                    </label>
                    <select
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-lg font-medium text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none group-hover:border-slate-300 dark:group-hover:border-slate-600 appearance-none cursor-pointer"
                        value={data.category || ''}
                        onChange={(e) => updateData('category', e.target.value)}
                    >
                        <option value="">Wählen Sie eine Kategorie</option>
                        <option value="apparel">Bekleidung & Accessoires</option>
                        <option value="electronics">Elektronik</option>
                        <option value="home">Haus & Garten</option>
                        <option value="beauty">Beauty & Gesundheit</option>
                    </select>
                </div>

                <div className="group">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                        <ShoppingBag size={16} className="text-indigo-500" />
                        Produkttyp
                    </label>
                    <input
                        type="text"
                        value={data.productType || ''}
                        onChange={(e) => updateData('productType', e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-lg font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none group-hover:border-slate-300 dark:group-hover:border-slate-600"
                        placeholder="z.B. T-Shirt"
                    />
                </div>

                <div className="group">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                        <Factory size={16} className="text-indigo-500" />
                        Hersteller / Marke
                    </label>
                    <input
                        type="text"
                        value={data.vendor || ''}
                        onChange={(e) => updateData('vendor', e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-lg font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none group-hover:border-slate-300 dark:group-hover:border-slate-600"
                        placeholder="Markenname"
                    />
                </div>

                <div className="group">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                        <Tag size={16} className="text-indigo-500" />
                        Tags
                    </label>
                    <input
                        type="text"
                        value={data.tags || ''}
                        onChange={(e) => updateData('tags', e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-lg font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none group-hover:border-slate-300 dark:group-hover:border-slate-600"
                        placeholder="Kommagetrennte Tags (z.B. Sommer, Baumwolle, Sale)"
                    />
                </div>
            </div>
        </div>
    );
};
