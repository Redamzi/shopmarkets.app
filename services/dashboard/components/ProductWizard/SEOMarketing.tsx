import React, { useState, useEffect } from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';
import { Search, Globe, Tag, PenTool } from 'lucide-react';

export const SEOMarketing: React.FC = () => {
    const { stepData, setStepData } = useProductWizardStore();
    // Key 9 is SEO/Marketing Step
    const savedData = stepData[9] || {};
    // Fallback to AI data from Key 2
    const aiData = stepData[2] || {};

    const [seo, setSeo] = useState({
        title: savedData.seo?.title || aiData.seo?.title || '',
        description: savedData.seo?.description || aiData.seo?.description || '',
        slug: savedData.seo?.slug || ''
    });

    const generateSlug = (title: string) => {
        return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    // Auto-Sync to Key 9
    useEffect(() => {
        setStepData(9, {
            ...savedData,
            seo: {
                ...seo,
                slug: seo.slug || generateSlug(seo.title || '')
            }
        });
    }, [seo, setStepData]); // Exclude savedData to prevent loop, rely on state

    return (
        <div className="max-w-4xl mx-auto p-2 md:p-6">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                    <Globe size={28} strokeWidth={1.5} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold font-serif-display text-slate-900 dark:text-white">SEO & Sichtbarkeit</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Optimieren Sie Ihr Produkt für Suchmaschinen.</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* SEO Section */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Search size={20} className="text-indigo-500" />
                        Google Vorschau (SERP)
                    </h3>

                    <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="font-sans">
                            <div className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200 mb-1">
                                <span className="bg-slate-200 dark:bg-slate-600 rounded-full w-6 h-6 flex items-center justify-center text-xs">S</span>
                                <span className="truncate">shop-markets.com › {seo.slug || 'produkt-url'}</span>
                            </div>
                            <h4 className="text-xl text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer truncate">
                                {seo.title || 'Produkt Titel hier...'}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                                {seo.description || 'Hier steht die Beschreibung, die Kunden in den Google-Suchergebnissen sehen werden. Sie sollte ansprechend sein und zum Klicken anregen.'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="group">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Meta Title (Seitentitel)</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={seo.title}
                                    onChange={(e) => setSeo({ ...seo, title: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-lg font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                    maxLength={60}
                                    placeholder="Kurz, prägnant, inkl. Keywords"
                                />
                                <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-1 rounded ${seo.title.length > 50 ? 'text-amber-500 bg-amber-50' : 'text-slate-400 bg-slate-100'}`}>
                                    {seo.title.length}/60
                                </span>
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Meta Description (Beschreibung)</label>
                            <div className="relative">
                                <textarea
                                    value={seo.description}
                                    onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none min-h-[100px]"
                                    maxLength={160}
                                    placeholder="Fassen Sie den Inhalt zusammen und nutzen Sie Keywords."
                                />
                                <span className={`absolute right-4 bottom-4 text-xs font-bold px-2 py-1 rounded ${seo.description.length > 150 ? 'text-amber-500 bg-amber-50' : 'text-slate-400 bg-slate-100'}`}>
                                    {seo.description.length}/160
                                </span>
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                <Tag size={16} className="text-indigo-500" />
                                URL Slug (Pfad)
                            </label>
                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 select-none">/product/</span>
                                    <input
                                        type="text"
                                        value={seo.slug}
                                        onChange={(e) => setSeo({ ...seo, slug: e.target.value })}
                                        className="w-full pl-20 px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                        placeholder="produkt-name"
                                    />
                                </div>
                                <button
                                    onClick={() => setSeo({ ...seo, slug: generateSlug(seo.title) })}
                                    className="px-6 py-4 bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-slate-700 transition"
                                    title="Automatisch generieren"
                                >
                                    <PenTool size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
