import React, { useState } from 'react';
import { useProductWizardStore } from '../store/productWizardStore';

const CHANNELS = [
    { id: 'shopify', name: 'Shopify', icon: '🛍️', requiredFields: ['title', 'price', 'stock'] },
    { id: 'woocommerce', name: 'WooCommerce', icon: '🛒', requiredFields: ['title', 'price', 'sku'] },
    { id: 'amazon', name: 'Amazon', icon: '📦', requiredFields: ['title', 'price', 'sku', 'category'] },
    { id: 'ebay', name: 'eBay', icon: '🏷️', requiredFields: ['title', 'price', 'stock'] },
    { id: 'tiktok', name: 'TikTok Shop', icon: '🎵', requiredFields: ['title', 'price', 'images'] },
    { id: 'instagram', name: 'Instagram Shopping', icon: '📸', requiredFields: ['title', 'price', 'images'] },
    { id: 'otto', name: 'Otto Market', icon: '🏬', requiredFields: ['title', 'price', 'sku', 'category'] },
    { id: 'zalando', name: 'Zalando', icon: '👗', requiredFields: ['title', 'price', 'sku', 'category'] }
];

export const ChannelsSync: React.FC = () => {
    const { stepData, setStepData, completeStep, setCurrentStep } = useProductWizardStore();
    const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

    const toggleChannel = (channelId: string) => {
        if (selectedChannels.includes(channelId)) {
            setSelectedChannels(selectedChannels.filter(id => id !== channelId));
        } else {
            setSelectedChannels([...selectedChannels, channelId]);
        }
    };

    const checkRequiredFields = (channel: typeof CHANNELS[0]) => {
        const allData = { ...stepData[2], ...stepData[3], ...stepData[4], ...stepData[5], ...stepData[6] };
        const missing = channel.requiredFields.filter(field => !allData[field]);
        return { ready: missing.length === 0, missing };
    };

    const handleNext = () => {
        setStepData(7, { channels: selectedChannels });
        completeStep(7);
        setCurrentStep(8);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-2">Channels & Sync</h2>
            <p className="text-gray-600 mb-6">Wählen Sie die Verkaufskanäle für Ihr Produkt</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
                {CHANNELS.map((channel) => {
                    const { ready, missing } = checkRequiredFields(channel);
                    const isSelected = selectedChannels.includes(channel.id);

                    return (
                        <button
                            key={channel.id}
                            onClick={() => toggleChannel(channel.id)}
                            className={`
                p-4 rounded-lg border-2 text-left transition-all
                ${isSelected
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-blue-300'
                                }
              `}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{channel.icon}</span>
                                    <h3 className="font-semibold">{channel.name}</h3>
                                </div>
                                {ready ? (
                                    <span className="text-green-500 text-sm">✅ Ready</span>
                                ) : (
                                    <span className="text-orange-500 text-sm">⚠️ Missing</span>
                                )}
                            </div>
                            {!ready && (
                                <p className="text-xs text-gray-600">
                                    Fehlende Felder: {missing.join(', ')}
                                </p>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-2">🚀 Bereit für Sync</h3>
                <p className="text-sm text-gray-700">
                    {selectedChannels.length} Kanal{selectedChannels.length !== 1 ? 'e' : ''} ausgewählt
                </p>
                {selectedChannels.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                        Produkt wird nach Speichern automatisch synchronisiert
                    </p>
                )}
            </div>

            <div className="flex gap-4">
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
