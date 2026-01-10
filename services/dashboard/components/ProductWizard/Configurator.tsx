import React from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';
import { Wrench } from 'lucide-react';

export const Configurator: React.FC = () => {
    const { stepData, setStepData } = useProductWizardStore();
    const data = stepData[11] || {}; // Step 11 is Extras

    const updateData = (key: string, value: any) => {
        setStepData(11, { ...data, [key]: value });
    };

    return (
        <div className="max-w-4xl mx-auto p-2 md:p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                    <Wrench size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold font-serif-display text-slate-900">Extras & Konfiguration</h2>
                    <p className="text-gray-500 text-sm">Zusätzliche Optionen und benutzerdefinierte Felder.</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <input
                        type="checkbox"
                        id="gift-wrap"
                        checked={data.giftWrap || false}
                        onChange={(e) => updateData('giftWrap', e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                        <label htmlFor="gift-wrap" className="block font-bold text-slate-900">Geschenkverpackung verfügbar</label>
                        <p className="text-sm text-slate-500">Kunden können an der Kasse eine Geschenkverpackung wählen.</p>
                    </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <input
                        type="checkbox"
                        id="personalization"
                        checked={data.personalization || false}
                        onChange={(e) => updateData('personalization', e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                        <label htmlFor="personalization" className="block font-bold text-slate-900">Personalisierung erlauben</label>
                        <p className="text-sm text-slate-500">Kunden können einen benutzerdefinierten Text eingeben (Gravur, Druck etc.).</p>
                    </div>
                </div>

                {data.personalization && (
                    <div className="pl-9">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Beschriftung für Kunden</label>
                        <input
                            type="text"
                            value={data.personalizationLabel || ''}
                            onChange={(e) => updateData('personalizationLabel', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="z.B. Gravur-Text (max. 20 Zeichen)"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
