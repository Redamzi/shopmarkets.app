import React from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';
import { Tag } from 'lucide-react';

export const Organization: React.FC = () => {
    const { stepData, setStepData } = useProductWizardStore();
    const data = stepData[10] || {}; // Step 10 is Organization

    const updateData = (key: string, value: any) => {
        setStepData(10, { ...data, [key]: value });
    };

    return (
        <div className="max-w-4xl mx-auto p-2 md:p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                    <Tag size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold font-serif-display text-slate-900">Organisation</h2>
                    <p className="text-gray-500 text-sm">Kategorisierung und Organisation Ihres Produkts.</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Produktkategorie</label>
                    <select
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
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

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Produkttyp</label>
                    <input
                        type="text"
                        value={data.productType || ''}
                        onChange={(e) => updateData('productType', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="z.B. T-Shirt"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Hersteller / Marke</label>
                    <input
                        type="text"
                        value={data.vendor || ''}
                        onChange={(e) => updateData('vendor', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Markenname"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
                    <input
                        type="text"
                        value={data.tags || ''}
                        onChange={(e) => updateData('tags', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Kommagetrennte Tags (z.B. Sommer, Baumwolle, Sale)"
                    />
                </div>
            </div>
        </div>
    );
};
