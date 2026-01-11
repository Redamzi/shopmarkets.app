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
    const { productType, setProductType } = useProductWizardStore();

    return (
        <div className="max-w-6xl mx-auto p-2 md:p-6">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-3 font-serif-display text-slate-900 dark:text-white">Produktart wählen</h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg">Was möchten Sie heute verkaufen?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PRODUCT_TYPES.map((type) => {
                    const isSelected = productType === type.id;
                    return (
                        <button
                            key={type.id}
                            onClick={() => setProductType(type.id)}
                            className={`
                                relative p-6 rounded-2xl text-left transition-all duration-300 group
                                border-2 
                                ${isSelected
                                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 shadow-lg shadow-indigo-500/10 scale-[1.02]'
                                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 hover:shadow-md'
                                }
                            `}
                        >
                            {isSelected && (
                                <div className="absolute top-4 right-4 w-3 h-3 bg-indigo-600 rounded-full animate-pulse shadow-md shadow-indigo-400/50" />
                            )}

                            <div className={`
                                w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors
                                ${isSelected
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                                }
                            `}>
                                {React.createElement(type.icon, { size: 28, strokeWidth: 1.5 })}
                            </div>

                            <h3 className={`font-bold text-lg mb-2 transition-colors ${isSelected ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-900 dark:text-white'}`}>
                                {type.name}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                {type.description}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
