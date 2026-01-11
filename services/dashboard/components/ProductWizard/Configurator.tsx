import React from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';
import { Wrench, Gift, Type, PenTool, Hash, AlignLeft, DollarSign, CheckCircle, XCircle } from 'lucide-react';

export const Configurator: React.FC = () => {
    const { stepData, setStepData } = useProductWizardStore();
    const data = stepData[11] || {}; // Step 11 is Extras

    const updateData = (key: string, value: any) => {
        setStepData(11, { ...data, [key]: value });
    };

    const updatePersonalization = (key: string, value: any) => {
        const currentPers = data.personalizationConfig || {};
        updateData('personalizationConfig', { ...currentPers, [key]: value });
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
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-indigo-200 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center text-indigo-500 shadow-sm border border-slate-100 dark:border-slate-600">
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
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-indigo-200 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center text-indigo-500 shadow-sm border border-slate-100 dark:border-slate-600">
                            <PenTool size={20} />
                        </div>
                        <div>
                            <label htmlFor="personalization" className="block text-lg font-bold text-slate-900 dark:text-white cursor-pointer">Personalisierung erlauben</label>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Kunden können einen benutzerdefinierten Text eingeben (Gravur, Druck, etc.).</p>
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

                {/* Detailed Personalization Config */}
                {data.personalization && (
                    <div className="animate-in slide-in-from-top-4 duration-300 ml-0 md:ml-14 space-y-6 pt-2">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Label */}
                            <div className="group col-span-1 md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                    <Type size={16} className="text-indigo-500" />
                                    Beschriftung (Label für den Kunden)
                                </label>
                                <input
                                    type="text"
                                    value={data.personalizationConfig?.label || ''}
                                    onChange={(e) => updatePersonalization('label', e.target.value)}
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-lg font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                    placeholder="z.B. Ihr Wunschtext für die Gravur"
                                />
                            </div>

                            {/* Max Chars */}
                            <div className="group">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                    <Hash size={16} className="text-indigo-500" />
                                    Maximale Zeichenanzahl
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={data.personalizationConfig?.maxChars || 20}
                                    onChange={(e) => updatePersonalization('maxChars', parseInt(e.target.value))}
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-lg font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                />
                            </div>

                            {/* Pricing Model */}
                            <div className="group">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                    <DollarSign size={16} className="text-indigo-500" />
                                    Preisgestaltung
                                </label>
                                <div className="flex rounded-xl bg-slate-50 dark:bg-slate-800 p-1 border-2 border-slate-100 dark:border-slate-700">
                                    <button
                                        onClick={() => updatePersonalization('pricingMode', 'fix')}
                                        className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${data.personalizationConfig?.pricingMode !== 'per_char' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
                                    >
                                        Fixpreis
                                    </button>
                                    <button
                                        onClick={() => updatePersonalization('pricingMode', 'per_char')}
                                        className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${data.personalizationConfig?.pricingMode === 'per_char' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
                                    >
                                        Pro Zeichen
                                    </button>
                                </div>
                            </div>

                            {/* Price Amount */}
                            <div className="group">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                    <DollarSign size={16} className="text-indigo-500" />
                                    {data.personalizationConfig?.pricingMode === 'per_char' ? 'Preis pro Zeichen (€)' : 'Aufpreis (€)'}
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.personalizationConfig?.price || 0}
                                    onChange={(e) => updatePersonalization('price', parseFloat(e.target.value))}
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-lg font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                    placeholder="0.00"
                                />
                            </div>

                            {/* Options: Multiline & Required */}
                            <div className="flex flex-col gap-4 justify-center">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="multiline"
                                        className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                                        checked={data.personalizationConfig?.isMultiline || false}
                                        onChange={(e) => updatePersonalization('isMultiline', e.target.checked)}
                                    />
                                    <label htmlFor="multiline" className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                                        <AlignLeft size={16} /> Mehrzeiliges Textfeld erlauben
                                    </label>
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="required"
                                        className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                                        checked={data.personalizationConfig?.required || false}
                                        onChange={(e) => updatePersonalization('required', e.target.checked)}
                                    />
                                    <label htmlFor="required" className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                                        <CheckCircle size={16} /> Pflichtfeld (Kunde muss ausfüllen)
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Preview Box */}
                        <div className="mt-8 p-6 bg-indigo-50/50 dark:bg-slate-800/50 rounded-xl border border-indigo-100 dark:border-slate-700">
                            <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-3">Vorschau für Kunden</h4>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-900 dark:text-white">
                                    {data.personalizationConfig?.label || 'Ihre Personalisierung'}
                                    {data.personalizationConfig?.required && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                {data.personalizationConfig?.isMultiline ? (
                                    <textarea disabled className="w-full p-3 border rounded-lg bg-white opacity-70" placeholder={`Geben Sie bis zu ${data.personalizationConfig?.maxChars || 20} Zeichen ein...`} rows={3} />
                                ) : (
                                    <input type="text" disabled className="w-full p-3 border rounded-lg bg-white opacity-70" placeholder={`Geben Sie bis zu ${data.personalizationConfig?.maxChars || 20} Zeichen ein...`} />
                                )}
                                <p className="text-xs text-slate-500 text-right">
                                    + {data.personalizationConfig?.price > 0 ? `${data.personalizationConfig?.price.toFixed(2)}€ ${data.personalizationConfig?.pricingMode === 'per_char' ? 'je Zeichen' : ''}` : 'Kostenlos'}
                                </p>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};
