import React from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';
import { Package, Layers, Grid, Cloud, Gift, Download, RefreshCw, Wand2, Calendar } from 'lucide-react';

const PRODUCT_TYPES = [
    { id: 'simple', name: 'Einfaches Produkt', description: 'Einzelartikel ohne Varianten', icon: Package },
    { id: 'configurable', name: 'Konfigurierbares Produkt', description: 'Mit Varianten (Größe, Farbe)', icon: Layers },
    { id: 'grouped', name: 'Gruppiertes Produkt', description: 'Produkt-Sets', icon: Grid },
    { id: 'virtual', name: 'Virtuelles Produkt', description: 'Keine physische Lieferung', icon: Cloud },
    { id: 'bundle', name: 'Bündelprodukt', description: 'Kunde stellt Paket zusammen', icon: Gift },
    { id: 'downloadable', name: 'Herunterladbares Produkt', description: 'Digitale Dateien', icon: Download },
    { id: 'subscription', name: 'Abo-Produkt', description: 'Wiederkehrende Zahlungen', icon: RefreshCw },
    { id: 'personalized', name: 'Personalisiertes Produkt', description: 'Web-to-Print, 3D', icon: Wand2 },
    { id: 'bookable', name: 'Buchbares Produkt', description: 'Termine, Reservierungen', icon: Calendar }
];

export const ProductTypeSelector: React.FC = () => {
    const { productType, setProductType, setCurrentStep } = useProductWizardStore();

    const handleSelect = (id: string) => {
        setProductType(id);
        // Automatisch zum Basis-Step (Step 3) springen, AI (Step 2) wird übersprungen aber bleibt sichtbar
        setCurrentStep(3);
    };

    return (
        <div className="max-w-7xl mx-auto p-2">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2 font-serif-display text-slate-900 dark:text-white">Produktart wählen</h2>
                <p className="text-slate-500 dark:text-slate-400">Was möchten Sie heute verkaufen?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {PRODUCT_TYPES.map((type) => {
                    const isSelected = productType === type.id;
                    return (
                        <button
                            key={type.id}
                            onClick={() => handleSelect(type.id)}
                            className={`
                                relative p-5 rounded-xl text-left transition-all duration-300 group
                                border border-transparent
                                ${isSelected
                                    ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500 scale-[1.02] shadow-md'
                                    : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1'
                                }
                            `}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className={`
                                    p-3 rounded-lg transition-colors
                                    ${isSelected
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                                    }
                                `}>
                                    {React.createElement(type.icon, { size: 22, strokeWidth: 1.5 })}
                                </div>
                                {isSelected && (
                                    <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse" />
                                )}
                            </div>

                            <h3 className={`font-bold text-base mb-1 transition-colors ${isSelected ? 'text-indigo-900' : 'text-slate-900 dark:text-white'}`}>
                                {type.name}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                                {type.description}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
