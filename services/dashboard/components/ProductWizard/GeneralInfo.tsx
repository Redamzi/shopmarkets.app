import React, { useEffect } from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';
import { Layers } from 'lucide-react';

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
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                    <Layers size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold font-serif-display text-slate-900">Basisinformationen</h2>
                    <p className="text-gray-500 text-sm">Grundlegende Details zu Ihrem Produkt.</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Produktname *</label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateData('title', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 font-medium text-lg"
                        placeholder="z.B. Premium Lederjacke"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Beschreibung</label>
                    <textarea
                        value={data.description || ''}
                        onChange={(e) => updateData('description', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        rows={6}
                        placeholder="Detaillierte Produktbeschreibung..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kurzbeschreibung (Optional)</label>
                    <textarea
                        value={data.shortDescription || ''}
                        onChange={(e) => updateData('shortDescription', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        rows={2}
                        placeholder="Zusammenfassung für Listenansichten..."
                    />
                </div>
            </div>
        </div>
    );
};
