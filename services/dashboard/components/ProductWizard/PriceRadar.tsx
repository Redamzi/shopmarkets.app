import React, { useState, useEffect } from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';
import { TrendingDown, Calculator, RefreshCw, ShoppingCart, ShoppingBag, Store, Video, Globe } from 'lucide-react';

const PLATFORM_FEES: Record<string, { fee: number, name: string, icon: any, color: string, bg: string }> = {
    amazon: { fee: 15, name: 'Amazon', icon: ShoppingCart, color: 'text-orange-600', bg: 'bg-orange-50' },
    ebay: { fee: 11, name: 'eBay', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    etsy: { fee: 6.5, name: 'Etsy', icon: Store, color: 'text-orange-700', bg: 'bg-orange-100' },
    tiktok: { fee: 5, name: 'TikTok Shop', icon: Video, color: 'text-black', bg: 'bg-gray-100' },
    shopify: { fee: 2, name: 'Shopify', icon: ShoppingBag, color: 'text-green-600', bg: 'bg-green-50' },
};

export const PriceRadar: React.FC = () => {
    const { stepData, setStepData, completeStep, setCurrentStep } = useProductWizardStore();
    const [basePrice, setBasePrice] = useState<number>(stepData[6]?.price || 0); // Get price from Pricing step (Key 6)
    const [autoCalc, setAutoCalc] = useState<boolean>(true);

    const calculateChannelPrice = (base: number, feePercent: number) => {
        // Formula: Target = Base / (1 - Fee/100) to maintain margin
        return Number((base / (1 - feePercent / 100)).toFixed(2));
    };

    const calculateProfit = (channelPrice: number, feePercent: number, base: number) => {
        const fees = channelPrice * (feePercent / 100);
        return (channelPrice - fees - base).toFixed(2);
    };

    // Update store when base price changes
    useEffect(() => {
        if (basePrice > 0) {
            // We might want to save generic price back to step 4
            // But here we just save step 5 data
            setStepData(5, { basePrice, autoCalc, fees: PLATFORM_FEES });
        }
    }, [basePrice, autoCalc, setStepData]);

    return (
        <div className="max-w-4xl mx-auto p-2 md:p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                    <TrendingDown size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold font-serif-display text-slate-900">Preis Radar & Gebühren</h2>
                    <p className="text-gray-500 text-sm">Automatische Kalkulation der Verkaufspreise basierend auf Marktplatz-Gebühren.</p>
                </div>
            </div>

            {/* Base Price Input */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Ihr gewünschter Basispreis (Netto)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">€</span>
                            <input
                                type="number"
                                value={basePrice || ''}
                                onChange={(e) => setBasePrice(parseFloat(e.target.value))}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                placeholder="0.00"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Das ist der Betrag, den Sie nach Abzug der Gebühren erhalten möchten.</p>
                    </div>

                    <div className="flex items-center gap-3 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                        <div className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${autoCalc ? 'bg-indigo-600' : 'bg-slate-300'}`} onClick={() => setAutoCalc(!autoCalc)}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${autoCalc ? 'translate-x-4' : ''}`}></div>
                        </div>
                        <div>
                            <span className="block text-sm font-bold text-indigo-900">Auto-Calc aktiv</span>
                            <span className="text-xs text-indigo-600/80">Preise automatisch anpassen</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Channel Calculation List */}
            <div className="grid grid-cols-1 gap-4">
                {Object.entries(PLATFORM_FEES).map(([key, data]) => {
                    const channelPrice = autoCalc && basePrice ? calculateChannelPrice(basePrice, data.fee) : basePrice;
                    const fees = (channelPrice * (data.fee / 100)).toFixed(2);
                    const netResult = (channelPrice - parseFloat(fees)).toFixed(2);
                    const isProfitStable = Math.abs(parseFloat(netResult) - basePrice) < 0.1;

                    return (
                        <div key={key} className="bg-white p-4 rounded-xl border border-slate-100 hover:border-slate-300 transition-all flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                            <div className="flex items-center gap-4 w-full md:w-1/3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${data.color.replace('text', 'bg').replace('600', '100')} ${data.color}`}>
                                    <data.icon size={18} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{data.name}</h4>
                                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Gebühr: {data.fee}%</span>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-2/3 justify-end">
                                <div className="text-center md:text-right">
                                    <span className="block text-xs text-slate-400 mb-0.5">Plattform-Gebühr</span>
                                    <span className="font-mono text-red-500 font-medium">- {fees} €</span>
                                </div>

                                <div className="text-center md:text-right">
                                    <span className="block text-xs text-slate-400 mb-0.5">Verkaufspreis</span>
                                    <div className="relative w-32">
                                        <input
                                            type="number"
                                            value={channelPrice || 0}
                                            readOnly={autoCalc}
                                            className={`w-full text-right font-bold bg-transparent border-b ${autoCalc ? 'border-transparent' : 'border-indigo-300'} focus:outline-none`}
                                        />
                                        <span className="absolute right-0 top-0 pointer-events-none text-slate-400 opacity-0">€</span>
                                    </div>
                                </div>

                                <div className="text-center md:text-right pl-4 border-l border-slate-100">
                                    <span className="block text-xs text-slate-400 mb-0.5">Ihr Netto</span>
                                    <span className={`font-bold text-lg ${isProfitStable ? 'text-green-600' : 'text-slate-900'}`}>{netResult} €</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
