import React, { useState } from 'react';
import { GeneralInfo } from './GeneralInfo';
import { AttributesVariants } from './AttributesVariants';
import { Organization } from './Organization';
import { Configurator } from './Configurator';
import { SEOMarketing } from './SEOMarketing';
import { Layers, SlidersHorizontal, Tag, Wrench, Video } from 'lucide-react';

export const StepDetails: React.FC = () => {
    const [subTab, setSubTab] = useState<'general' | 'variants' | 'org' | 'extras' | 'tiktok'>('general');

    const tabs = [
        { id: 'general', label: 'Basis', icon: Layers, component: GeneralInfo },
        { id: 'variants', label: 'Varianten', icon: SlidersHorizontal, component: AttributesVariants },
        { id: 'org', label: 'Organisation', icon: Tag, component: Organization },
        { id: 'extras', label: 'Extras', icon: Wrench, component: Configurator },
        { id: 'tiktok', label: 'TikTok/SEO', icon: Video, component: SEOMarketing },
    ];

    const ActiveComponent = tabs.find(t => t.id === subTab)?.component || GeneralInfo;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setSubTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${subTab === tab.id
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {React.createElement(tab.icon, { size: 16 })}
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <ActiveComponent />
            </div>
        </div>
    );
};
