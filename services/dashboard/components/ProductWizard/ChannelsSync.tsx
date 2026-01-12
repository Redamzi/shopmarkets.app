```
import React, { useState, useEffect } from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';
import { Store, ShoppingCart, ShoppingBag, Video, Instagram, Globe, CheckCircle2, AlertTriangle, Layers, Share2 } from 'lucide-react';

const CHANNELS = [
    { id: 'shopify', name: 'Shopify', icon: ShoppingBag, requiredFields: ['title', 'price'] },
    { id: 'tiktok', name: 'TikTok Shop', icon: Video, requiredFields: ['title', 'price', 'video'] }, // Video required for TikTok
    { id: 'instagram', name: 'Instagram Shopping', icon: Instagram, requiredFields: ['title', 'price'] },
    { id: 'amazon', name: 'Amazon', icon: BoxIcon, requiredFields: ['title', 'price', 'sku'] },
    { id: 'woocommerce', name: 'WooCommerce', icon: Store, requiredFields: ['title', 'price'] },
    { id: 'ebay', name: 'eBay', icon: TagIcon, requiredFields: ['title', 'price'] },
    { id: 'zalando', name: 'Zalando', icon: Globe, requiredFields: ['title', 'price', 'sku'] }
];

function BoxIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
}

function TagIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>;
}

export const ChannelsSync: React.FC = () => {
    const { stepData, setStepData } = useProductWizardStore();
    const savedChannelsData = stepData[12] || {};
    const savedChannels = savedChannelsData.channels || [];

    // Media Data from Step 3 (or wherever it is) for validation
    const mediaData = stepData[3] || {};
    const productVideo = mediaData.video;

    const [selectedChannels, setSelectedChannels] = useState<string[]>(Array.isArray(savedChannels) ? savedChannels : []);

    const toggleChannel = (channelId: string) => {
        if (selectedChannels.includes(channelId)) {
            setSelectedChannels(selectedChannels.filter(id => id !== channelId));
        } else {
            setSelectedChannels([...selectedChannels, channelId]);
        }
    };

    // Auto-Sync to Key 12
    useEffect(() => {
        setStepData(12, {
            channels: selectedChannels,
            // Pass minimal data if needed, but master data is now elsewhere
        });
    }, [selectedChannels, setStepData]);


    const checkRequiredFields = (channel: typeof CHANNELS[0]) => {
        const title = stepData[2]?.title; 
        
        // Simple check
        const missing = [];
        if (channel.id === 'tiktok' && !productVideo) missing.push('Video');
        
        return { ready: missing.length === 0, missing };
    };

    return (
        <div className="max-w-6xl mx-auto p-2 md:p-6 space-y-10">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                    <Share2 size={24} strokeWidth={1.5} />
                </div>
                <div>
                    <h2 className="text-xl font-bold font-serif-display text-slate-900 dark:text-white">Channel Auswahl</h2>
                    <p className="text-slate-500 dark:text-slate-400">Auf welchen Plattformen soll das Produkt verkauft werden?</p>
                </div>
            </div>

            {/* Channel Selection Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {CHANNELS.map((channel) => {
                    const { ready, missing } = checkRequiredFields(channel);
                    const isSelected = selectedChannels.includes(channel.id);

                    return (
                        <button
                            key={channel.id}
                            onClick={() => toggleChannel(channel.id)}
                            className={`
                                relative p - 4 rounded - xl text - left transition - all duration - 300 group flex flex - col h - full border
                                ${
    isSelected
        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-md ring-1 ring-indigo-600'
        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1'
}
`}
                        >
                            {isSelected && (
                                <div className="absolute top-3 right-3 text-indigo-600">
                                    <CheckCircle2 size={18} fill="currentColor" className="text-white" />
                                </div>
                            )}

                            <div className={`
w - 10 h - 10 rounded - lg flex items - center justify - center mb - 3 transition - colors
                                ${
    isSelected
        ? 'bg-indigo-600 text-white'
        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
}
`}>
                                {React.createElement(channel.icon, { size: 20, strokeWidth: 1.5 })}
                            </div>

                            <h3 className={`font - bold text - sm mb - 1 ${ isSelected ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-900 dark:text-white' } `}>
                                {channel.name}
                            </h3>

                            {!ready && isSelected && (
                                <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                    <AlertTriangle size={10} />
                                    <span>{missing.join(', ')} fehlt</span>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
```
