import React from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';
import { Wrench, Gift, Type, PenTool } from 'lucide-react';

export const Configurator: React.FC = () => {
    const { stepData, setStepData } = useProductWizardStore();
    const data = stepData[11] || {}; // Step 11 is Extras

    const updateData = (key: string, value: any) => {
        setStepData(11, { ...data, [key]: value });
    };

    return (
        <div className="max-w-4xl mx-auto p-2 md:p-6">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                    <Wrench size={28} strokeWidth={1.5} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold font-serif-display text-slate-900 dark:text-white">Extras & Konfiguration</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Zusätzliche Optionen und benutzerdefinierte Felder.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 space-y-6">

                {/* Gift Wrap Switch */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center text-indigo-500 shadow-sm">
                            <Gift size={20} />
                        </div>
                        <div>
                            <label htmlFor="gift-wrap" className="block text-lg font-bold text-slate-900 dark:text-white cursor-pointer">Geschenkverpackung verfügbar</label>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Kunden können an der Kasse eine Geschenkverpackung wählen.</p>
                        </div>
                    </div>
                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                        <input
                            type="checkbox"
                            id="gift-wrap"
                            className="absolute w-12 h-6 opacity-0 cursor-pointer z-10"
                            checked={data.giftWrap || false}
                            onChange={(e) => updateData('giftWrap', e.target.checked)}
                        />
                        <div className={`w-12 h-6 rounded-full shadow-inner transition-colors ${data.giftWrap ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                        <div className={`absolute left-0 top-0 w-6 h-6 bg-white rounded-full shadow transform transition-transform ${data.giftWrap ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                </div>

                {/* Personalization Switch */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center text-indigo-500 shadow-sm">
                            <PenTool size={20} />
                        </div>
                        <div>
                            <label htmlFor="personalization" className="block text-lg font-bold text-slate-900 dark:text-white cursor-pointer">Personalisierung erlauben</label>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Kunden können einen benutzerdefinierten Text eingeben (Gravur, Druck etc.).</p>
                        </div>
                    </div>
                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                        <input
                            type="checkbox"
                            id="personalization"
                            className="absolute w-12 h-6 opacity-0 cursor-pointer z-10"
                            checked={data.personalization || false}
                            onChange={(e) => updateData('personalization', e.target.checked)}
                        />
                        <div className={`w-12 h-6 rounded-full shadow-inner transition-colors ${data.personalization ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                        <div className={`absolute left-0 top-0 w-6 h-6 bg-white rounded-full shadow transform transition-transform ${data.personalization ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                </div>

                {/* Personalization Input */}
                {data.personalization && (
                    <div className="animate-in slide-in-from-top-2 duration-300 pl-4 md:pl-14">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                            <Type size={16} className="text-indigo-500" />
                            Beschriftung für Kunden
                        </label>
                        <input
                            type="text"
                            value={data.personalizationLabel || ''}
                            onChange={(e) => updateData('personalizationLabel', e.target.value)}
                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-lg font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                            placeholder="z.B. Gravur-Text (max. 20 Zeichen)"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
