import React, { useState, useEffect } from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';
import { Store, ShoppingCart, ShoppingBag, Video, Instagram, Globe, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

const CHANNELS = [
    { id: 'shopify', name: 'Shopify', icon: ShoppingBag, requiredFields: ['title', 'price'] }, // simplified reqs
    { id: 'woocommerce', name: 'WooCommerce', icon: Store, requiredFields: ['title', 'price'] },
    { id: 'amazon', name: 'Amazon', icon: BoxIcon, requiredFields: ['title', 'price', 'sku'] },
    { id: 'ebay', name: 'eBay', icon: TagIcon, requiredFields: ['title', 'price'] },
    { id: 'tiktok', name: 'TikTok Shop', icon: Video, requiredFields: ['title', 'price'] },
    { id: 'instagram', name: 'Instagram Shopping', icon: Instagram, requiredFields: ['title', 'price'] },
    { id: 'otto', name: 'Otto Market', icon: Layers, requiredFields: ['title', 'price', 'sku'] },
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
    const savedChannels = stepData[12]?.channels || [];

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
        setStepData(12, { channels: selectedChannels });
    }, [selectedChannels, setStepData]);

    // Simplified checks based on available data in store
    const checkRequiredFields = (channel: typeof CHANNELS[0]) => {
        // Gathering validation data from various steps
        // Step 2: Title, Step 6: Price, Step 7: Stock/SKU
        const title = stepData[2]?.title;
        const price = stepData[6]?.price;
        const sku = stepData[7]?.sku;

        const hasTitle = !!title;
        const hasPrice = !!price;
        const hasSku = !!sku;

        const missing = [];
        if (channel.requiredFields.includes('title') && !hasTitle) missing.push('Titel');
        if (channel.requiredFields.includes('price') && !hasPrice) missing.push('Preis');
        if (channel.requiredFields.includes('sku') && !hasSku) missing.push('SKU');

        return { ready: missing.length === 0, missing };
    };

    return (
        <div className="max-w-5xl mx-auto p-2 md:p-6">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                    <Globe size={28} strokeWidth={1.5} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold font-serif-display text-slate-900 dark:text-white">Channels & Sync</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Wählen Sie die Verkaufskanäle für Ihr Produkt.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {CHANNELS.map((channel) => {
                    const { ready, missing } = checkRequiredFields(channel);
                    const isSelected = selectedChannels.includes(channel.id);

                    return (
                        <button
                            key={channel.id}
                            onClick={() => toggleChannel(channel.id)}
                            className={`
                                relative p-6 rounded-2xl text-left transition-all duration-300 group flex flex-col h-full
                                border-2 
                                ${isSelected
                                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 shadow-lg shadow-indigo-500/10'
                                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 hover:shadow-md'
                                }
                            `}
                        >
                            {isSelected && (
                                <div className="absolute top-4 right-4 text-indigo-600">
                                    <CheckCircle2 size={24} fill="currentColor" className="text-white" />
                                </div>
                            )}

                            <div className={`
                                w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors
                                ${isSelected
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                                }
                            `}>
                                {React.createElement(channel.icon, { size: 24, strokeWidth: 1.5 })}
                            </div>

                            <h3 className={`font-bold text-lg mb-1 ${isSelected ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-900 dark:text-white'}`}>
                                {channel.name}
                            </h3>

                            <div className="mt-auto pt-4">
                                {ready ? (
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md w-fit">
                                        <CheckCircle2 size={12} />
                                        <span>Bereit</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md w-fit">
                                        <AlertTriangle size={12} />
                                        <span>Fehlende Infos</span>
                                    </div>
                                )}

                                {!ready && (
                                    <p className="text-xs text-slate-400 mt-2">
                                        Fehlt: {missing.join(', ')}
                                    </p>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border border-blue-100 dark:border-slate-700 rounded-2xl p-6 flex items-start gap-4">
                <span className="text-2xl">🚀</span>
                <div>
                    <h3 className="font-bold text-indigo-900 dark:text-white mb-1">Bereit für Synchronisation</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                        {selectedChannels.length === 0
                            ? "Keine Kanäle ausgewählt. Das Produkt wird nur lokal gespeichert."
                            : `${selectedChannels.length} Kanal${selectedChannels.length !== 1 ? 'e' : ''} ausgewählt. Das Produkt wird nach dem Speichern automatisch synchronisiert.`
                        }
                    </p>
                </div>
            </div>
        </div>
    );
};
