import React, { useState } from 'react';
import { PricingInventory } from './PricingInventory';
import { Inventory } from './Inventory';
import { Shipping } from './Shipping';
import { PriceRadar } from './PriceRadar';
import { DollarSign, Box, Truck, TrendingDown } from 'lucide-react';

export const StepPricing: React.FC = () => {
    const [subTab, setSubTab] = useState<'pricing' | 'radar' | 'inventory' | 'shipping'>('pricing');

    const tabs = [
        { id: 'pricing', label: 'Preise', icon: DollarSign, component: PricingInventory },
        { id: 'radar', label: 'Preis Radar', icon: TrendingDown, component: PriceRadar },
        { id: 'inventory', label: 'Lager', icon: Box, component: Inventory },
        { id: 'shipping', label: 'Versand', icon: Truck, component: Shipping },
    ];

    const ActiveComponent = tabs.find(t => t.id === subTab)?.component || PricingInventory;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setSubTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${subTab === tab.id
                                ? 'bg-emerald-50 text-emerald-700'
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
