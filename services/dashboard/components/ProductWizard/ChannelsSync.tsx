import React, { useState, useEffect } from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';
import { Store, ShoppingCart, ShoppingBag, Video, Instagram, Globe, CheckCircle2, AlertTriangle, Layers, Share2, Server, Lock } from 'lucide-react';
import { connectionService } from '../../services/connectionService';

// Define static config for supported platform types
// This maps the 'platform' string from database to UI elements
const PLATFORM_CONFIG: Record<string, any> = {
    'shopify': { name: 'Shopify', icon: ShoppingBag, requiredFields: ['title', 'price'] },
    'tiktok': { name: 'TikTok Shop', icon: Video, requiredFields: ['title', 'price', 'video'] },
    'instagram': { name: 'Instagram Shopping', icon: Instagram, requiredFields: ['title', 'price'] },
    'amazon': { name: 'Amazon', icon: BoxIcon, requiredFields: ['title', 'price', 'sku'] },
    'woocommerce': { name: 'WooCommerce', icon: ShoppingCart, requiredFields: ['title', 'price'] },
    'ebay': { name: 'eBay', icon: TagIcon, requiredFields: ['title', 'price'] },
    'zalando': { name: 'Zalando', icon: Globe, requiredFields: ['title', 'price', 'sku'] }
};

// The Master Channel (Native)
const NATIVE_CHANNEL = {
    id: 'native',
    platform: 'native',
    name: 'ShopMarkets Native',
    description: 'Ihr Haupt-Onlineshop (Master)',
    icon: Store,
    requiredFields: ['title', 'price']
};

function BoxIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
}

function TagIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>;
}

export const ChannelsSync: React.FC = () => {
    const { stepData, setStepData } = useProductWizardStore();
    const savedChannelsData = stepData[12] || {};
    // Ensure native is always in the saved selection if initialized
    const savedChannels = savedChannelsData.channels || ['native'];

    // Media for validation
    const mediaData = stepData[3] || {};
    const productVideo = mediaData.video;

    const [selectedChannels, setSelectedChannels] = useState<string[]>(Array.isArray(savedChannels) ? savedChannels : ['native']);

    // Connected platforms from DB
    const [connectedPlatforms, setConnectedPlatforms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConnections = async () => {
            try {
                const connections = await connectionService.getConnections();
                setConnectedPlatforms(connections);

                // If native is missing in selection (should not happen), add it
                if (!selectedChannels.includes('native')) {
                    setSelectedChannels(prev => ['native', ...prev]);
                }
            } catch (err) {
                console.error('Error fetching connections', err);
            } finally {
                setLoading(false);
            }
        };
        fetchConnections();
    }, []);

    const toggleChannel = (channelId: string) => {
        if (channelId === 'native') return; // Cannot toggle native

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
        });
    }, [selectedChannels, setStepData]);


    const checkRequiredFields = (platformId: string) => {
        if (platformId === 'tiktok' && !productVideo) return { ready: false, missing: ['Video'] };
        return { ready: true, missing: [] };
    };

    // Build the display list: Native + Connected
    const displayList = [
        // 1. Native Store (Manual Object)
        {
            ...NATIVE_CHANNEL,
            uniqueId: 'native'
        },
        // 2. Connected Channels
        ...connectedPlatforms.map(conn => {
            const config = PLATFORM_CONFIG[conn.platform] || { name: conn.platform, icon: Globe, requiredFields: [] };
            return {
                ...config,
                id: conn.platform, // Use platform type as ID for selection logic (or should we use conn.id? usually we want to sync to "shopify" generally or specific instance? Assuming 1 per type for now or using platform type as key)
                // For simplified wizard, let's use platform type. If user has 2 shopify stores, this logic might need refinement.
                uniqueId: conn.id || conn.platform,
                platformType: conn.platform
            };
        })
    ];

    if (loading) {
        return <div className="p-10 text-center text-slate-400">Lade Verbindungen...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-2 md:p-6 space-y-10">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                    <Share2 size={24} strokeWidth={1.5} />
                </div>
                <div>
                    <h2 className="text-xl font-bold font-serif-display text-slate-900 dark:text-white">Vertriebskanäle</h2>
                    <p className="text-slate-500 dark:text-slate-400">Wo soll das Produkt live gehen? ShopMarkets Native ist Ihre Basis.</p>
                </div>
            </div>

            {/* Channel Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayList.map((channel) => {
                    const isNative = channel.id === 'native';
                    // Use platform type or ID for selection check. 
                    // Assuming we select by platform type for simplicity as per wizard design
                    const selectionId = isNative ? 'native' : channel.platformType || channel.id;

                    const isSelected = selectedChannels.includes(selectionId);
                    const { ready, missing } = checkRequiredFields(selectionId);

                    return (
                        <button
                            key={channel.uniqueId}
                            onClick={() => toggleChannel(selectionId)}
                            className={`
                                relative p-4 rounded-xl text-left transition-all duration-300 group flex flex-col h-full border
                                ${isSelected
                                    ? isNative
                                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10 shadow-md ring-1 ring-indigo-600 cursor-default'
                                        : 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-md ring-1 ring-indigo-600'
                                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1'
                                }
                            `}
                        >
                            {isSelected && (
                                <div className={`absolute top-3 right-3 ${isNative ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                    {isNative ? <Lock size={18} /> : <CheckCircle2 size={18} fill="currentColor" className="text-white" />}
                                </div>
                            )}

                            <div className="flex items-start gap-4 mb-4">
                                <div className={`
                                    w-12 h-12 rounded-lg flex items-center justify-center transition-colors shrink-0
                                    ${isSelected
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                                    }
                                `}>
                                    {React.createElement(channel.icon, { size: 24, strokeWidth: 1.5 })}
                                </div>
                                <div>
                                    <h3 className={`font-bold text-lg leading-tight mb-1 ${isSelected ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-900 dark:text-white'} `}>
                                        {channel.name}
                                    </h3>
                                    {isNative && (
                                        <span className="inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                                            Master
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Description for Native or Missing info for others */}
                            {isNative ? (
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-auto">
                                    Ihre zentrale Shop-Verwaltung. Alle Daten werden hier gemastert und synchronisiert.
                                </p>
                            ) : (
                                <div className="mt-auto">
                                    {!ready && isSelected ? (
                                        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded w-full">
                                            <AlertTriangle size={14} />
                                            <span>{missing.join(', ')} fehlt</span>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400 dark:text-slate-500">
                                            Synchronisierung aktiv
                                        </p>
                                    )}
                                </div>
                            )}
                        </button>
                    );
                })}

                {/* Add Connection Placeholder if list is empty (except native) */}
                {displayList.length === 1 && (
                    <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center text-slate-400 h-full min-h-[160px]">
                        <Server size={32} strokeWidth={1} className="mb-2 opacity-50" />
                        <p className="text-sm">Keine weiteren Kanäle verbunden.</p>
                        <a href="/connections" className="text-sm text-indigo-600 hover:text-indigo-500 font-medium mt-2 hover:underline">
                            Verbindungen verwalten &rarr;
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};
