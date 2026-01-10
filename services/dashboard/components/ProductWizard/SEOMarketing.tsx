import React, { useState } from 'react';
import { useProductWizardStore } from '../store/productWizardStore';

export const SEOMarketing: React.FC = () => {
    const { stepData, setStepData, completeStep, setCurrentStep } = useProductWizardStore();
    const aiData = stepData[2];

    const [seo, setSeo] = useState({
        title: aiData?.seo?.title || '',
        description: aiData?.seo?.description || '',
        slug: ''
    });

    const [tiktok, setTiktok] = useState({
        caption: aiData?.tiktok?.caption || '',
        hashtags: aiData?.tiktok?.hashtags?.join(' ') || ''
    });

    const generateSlug = (title: string) => {
        return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    const handleNext = () => {
        setStepData(6, {
            seo: {
                ...seo,
                slug: seo.slug || generateSlug(seo.title)
            },
            tiktok: {
                caption: tiktok.caption,
                hashtags: tiktok.hashtags.split(' ').filter(h => h.startsWith('#')).slice(0, 5)
            }
        });
        completeStep(6);
        setCurrentStep(7);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-2">SEO & Marketing</h2>
            <p className="text-gray-600 mb-6">Optimieren Sie Ihr Produkt für Suchmaschinen und Social Media</p>

            <div className="space-y-6">
                <div>
                    <h3 className="font-semibold mb-4">SEO</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Meta Title</label>
                            <input
                                type="text"
                                value={seo.title}
                                onChange={(e) => setSeo({ ...seo, title: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                                maxLength={60}
                                placeholder="Optimierter Titel für Suchmaschinen"
                            />
                            <p className="text-xs text-gray-500 mt-1">{seo.title.length}/60 Zeichen</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Meta Description</label>
                            <textarea
                                value={seo.description}
                                onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                                rows={3}
                                maxLength={160}
                                placeholder="Beschreibung für Suchergebnisse"
                            />
                            <p className="text-xs text-gray-500 mt-1">{seo.description.length}/160 Zeichen</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">URL Slug</label>
                            <input
                                type="text"
                                value={seo.slug}
                                onChange={(e) => setSeo({ ...seo, slug: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                                placeholder="produkt-url-slug"
                            />
                            <button
                                onClick={() => setSeo({ ...seo, slug: generateSlug(seo.title) })}
                                className="text-sm text-blue-500 hover:underline mt-1"
                            >
                                Automatisch generieren
                            </button>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold mb-4">TikTok Integration</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Caption</label>
                            <textarea
                                value={tiktok.caption}
                                onChange={(e) => setTiktok({ ...tiktok, caption: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                                rows={3}
                                maxLength={150}
                                placeholder="Spannende Caption für TikTok..."
                            />
                            <p className="text-xs text-gray-500 mt-1">{tiktok.caption.length}/150 Zeichen</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Hashtags</label>
                            <input
                                type="text"
                                value={tiktok.hashtags}
                                onChange={(e) => setTiktok({ ...tiktok, hashtags: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                                placeholder="#fashion #style #trending"
                            />
                            <p className="text-xs text-gray-500 mt-1">Max 5 Hashtags, mit # beginnen</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 mt-8">
                <button
                    onClick={handleNext}
                    className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600"
                >
                    Weiter
                </button>
            </div>
        </div>
    );
};
