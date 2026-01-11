import React, { useState, useEffect } from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';
import { Search, Share2, Globe, Hash, Music, Repeat, Scissors } from 'lucide-react';

export const SEOMarketing: React.FC = () => {
    const { stepData, setStepData } = useProductWizardStore();
    // Key 9 is SEO/TikTok
    const savedData = stepData[9] || {};
    // Fallback to AI data from Key 2 if Key 9 is empty
    const aiData = stepData[2] || {};

    const [seo, setSeo] = useState({
        title: savedData.seo?.title || aiData.seo?.title || '',
        description: savedData.seo?.description || aiData.seo?.description || '',
        slug: savedData.seo?.slug || ''
    });

    const [tiktok, setTiktok] = useState({
        caption: savedData.tiktok?.caption || aiData.tiktok?.caption || '',
        hashtags: Array.isArray(savedData.tiktok?.hashtags)
            ? savedData.tiktok.hashtags.join(' ')
            : (savedData.tiktok?.hashtags || aiData.tiktok?.hashtags || ''),
        sound: savedData.tiktok?.sound || '',
        duet: savedData.tiktok?.duet !== false, // Default true
        stitch: savedData.tiktok?.stitch !== false // Default true
    });

    const generateSlug = (title: string) => {
        return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    // Auto-Sync to Key 9
    useEffect(() => {
        setStepData(9, {
            seo: {
                ...seo,
                slug: seo.slug || generateSlug(seo.title || '')
            },
            tiktok: {
                ...tiktok,
                hashtags: tiktok.hashtags.split(' ').filter((h: string) => h.startsWith('#')).slice(0, 5)
            }
        });
    }, [seo, tiktok, setStepData]);

    return (
        <div className="max-w-4xl mx-auto p-2 md:p-6">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                    <Share2 size={28} strokeWidth={1.5} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold font-serif-display text-slate-900 dark:text-white">SEO & Marketing</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Optimieren Sie Ihr Produkt für Suchmaschinen und Social Media.</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* SEO Section */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Search size={20} className="text-indigo-500" />
                        Suchmaschinenoptimierung (SEO)
                    </h3>

                    <div className="space-y-6">
                        <div className="group">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Meta Title</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={seo.title}
                                    onChange={(e) => setSeo({ ...seo, title: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-lg font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                    maxLength={60}
                                    placeholder="Optimierter Titel"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                                    {seo.title.length}/60
                                </span>
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Meta Description</label>
                            <div className="relative">
                                <textarea
                                    value={seo.description}
                                    onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none min-h-[100px]"
                                    maxLength={160}
                                    placeholder="Beschreibung für Suchergebnisse"
                                />
                                <span className="absolute right-4 bottom-4 text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                                    {seo.description.length}/160
                                </span>
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                <Globe size={16} className="text-indigo-500" />
                                URL Slug
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={seo.slug}
                                    onChange={(e) => setSeo({ ...seo, slug: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                    placeholder="produkt-url-slug"
                                />
                                <button
                                    onClick={() => setSeo({ ...seo, slug: generateSlug(seo.title) })}
                                    className="px-6 py-4 bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-slate-700 transition"
                                >
                                    Auto
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TikTok Section */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Share2 size={20} className="text-pink-500" />
                        TikTok Integration
                    </h3>

                    <div className="space-y-6">
                        <div className="group">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Caption</label>
                            <div className="relative">
                                <textarea
                                    value={tiktok.caption}
                                    onChange={(e) => setTiktok({ ...tiktok, caption: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all outline-none min-h-[80px]"
                                    maxLength={150}
                                    placeholder="Spannende Caption für TikTok..."
                                />
                                <span className="absolute right-4 bottom-4 text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                                    {tiktok.caption.length}/150
                                </span>
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                <Hash size={16} className="text-pink-500" />
                                Hashtags
                            </label>
                            <input
                                type="text"
                                value={tiktok.hashtags}
                                onChange={(e) => setTiktok({ ...tiktok, hashtags: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all outline-none"
                                placeholder="#fashion #style #trending"
                            />
                            <p className="text-xs text-slate-400 mt-2 px-1">Maximal 5 Hashtags, beginnend mit #</p>
                        </div>

                        <div className="group">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                <Music size={16} className="text-pink-500" />
                                Sound / Audio (Link oder Name)
                            </label>
                            <input
                                type="text"
                                value={tiktok.sound}
                                onChange={(e) => setTiktok({ ...tiktok, sound: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all outline-none"
                                placeholder="z.B. Trending Sound - Artist"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Duet Toggle */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-pink-200 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center text-pink-500 shadow-sm border border-slate-100 dark:border-slate-600">
                                        <Repeat size={20} />
                                    </div>
                                    <div>
                                        <label htmlFor="duet" className="block text-lg font-bold text-slate-900 dark:text-white cursor-pointer">Duet erlauben</label>
                                    </div>
                                </div>
                                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id="duet"
                                        className="absolute w-12 h-6 opacity-0 cursor-pointer z-10"
                                        checked={tiktok.duet}
                                        onChange={(e) => setTiktok({ ...tiktok, duet: e.target.checked })}
                                    />
                                    <div className={`w-12 h-6 rounded-full shadow-inner transition-colors ${tiktok.duet ? 'bg-pink-600' : 'bg-slate-300'}`}></div>
                                    <div className={`absolute left-0 top-0 w-6 h-6 bg-white rounded-full shadow transform transition-transform ${tiktok.duet ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </div>
                            </div>

                            {/* Stitch Toggle */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-pink-200 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center text-pink-500 shadow-sm border border-slate-100 dark:border-slate-600">
                                        <Scissors size={20} />
                                    </div>
                                    <div>
                                        <label htmlFor="stitch" className="block text-lg font-bold text-slate-900 dark:text-white cursor-pointer">Stitch erlauben</label>
                                    </div>
                                </div>
                                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id="stitch"
                                        className="absolute w-12 h-6 opacity-0 cursor-pointer z-10"
                                        checked={tiktok.stitch}
                                        onChange={(e) => setTiktok({ ...tiktok, stitch: e.target.checked })}
                                    />
                                    <div className={`w-12 h-6 rounded-full shadow-inner transition-colors ${tiktok.stitch ? 'bg-pink-600' : 'bg-slate-300'}`}></div>
                                    <div className={`absolute left-0 top-0 w-6 h-6 bg-white rounded-full shadow transform transition-transform ${tiktok.stitch ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
