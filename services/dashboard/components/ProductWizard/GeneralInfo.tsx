import React, { useEffect } from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';
import { Layers, Type, AlignLeft, FileText } from 'lucide-react';

export const GeneralInfo: React.FC = () => {
    const { stepData, setStepData, aiOutput } = useProductWizardStore();
    const data = stepData[2] || {}; // Step 2 is Basis

    // Pre-fill from AI if available and empty
    useEffect(() => {
        if (aiOutput && !data.title) {
            setStepData(2, {
                ...data,
                title: aiOutput.title,
                description: aiOutput.description,
                shortDescription: aiOutput.short_description
            });
        }
    }, [aiOutput]);

    const updateData = (key: string, value: any) => {
        setStepData(2, { ...data, [key]: value });
    };

    return (
        <div className="max-w-4xl mx-auto p-2 md:p-6">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                    <Layers size={28} strokeWidth={1.5} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold font-serif-display text-slate-900 dark:text-white">Basisinformationen</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Grundlegende Details zu Ihrem Produkt.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 space-y-8">
                <div className="group">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                        <Type size={16} className="text-indigo-500" />
                        Produktname <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateData('title', e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-lg font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none group-hover:border-slate-300 dark:group-hover:border-slate-600"
                        placeholder="z.B. Premium Lederjacke"
                        required
                    />
                </div>

                <div className="group">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                        <AlignLeft size={16} className="text-indigo-500" />
                        Beschreibung
                    </label>
                    <textarea
                        value={data.description || ''}
                        onChange={(e) => updateData('description', e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none group-hover:border-slate-300 dark:group-hover:border-slate-600 min-h-[160px] leading-relaxed"
                        placeholder="Beschreiben Sie Ihr Produkt im Detail..."
                    />
                </div>

                <div className="group">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                        <FileText size={16} className="text-indigo-500" />
                        Kurzbeschreibung (Optional)
                    </label>
                    <textarea
                        value={data.shortDescription || ''}
                        onChange={(e) => updateData('shortDescription', e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none group-hover:border-slate-300 dark:group-hover:border-slate-600 min-h-[100px]"
                        placeholder="Zusammenfassung für Listenansichten..."
                    />
                </div>
            </div>
        </div>
    );
};
