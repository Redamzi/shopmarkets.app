import React from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';

const PRODUCT_TYPES = [
    { id: 'simple', name: 'Einfaches Produkt', description: 'Einzelartikel ohne Varianten', icon: '📦' },
    { id: 'configurable', name: 'Konfigurierbares Produkt', description: 'Mit Varianten (Größe, Farbe)', icon: '🎨' },
    { id: 'grouped', name: 'Gruppiertes Produkt', description: 'Produkt-Sets', icon: '📚' },
    { id: 'virtual', name: 'Virtuelles Produkt', description: 'Keine physische Lieferung', icon: '☁️' },
    { id: 'bundle', name: 'Bündelprodukt', description: 'Kunde stellt Paket zusammen', icon: '🎁' },
    { id: 'downloadable', name: 'Herunterladbares Produkt', description: 'Digitale Dateien', icon: '💾' },
    { id: 'subscription', name: 'Abo-Produkt', description: 'Wiederkehrende Zahlungen', icon: '🔄' },
    { id: 'personalized', name: 'Personalisiertes Produkt', description: 'Web-to-Print, 3D', icon: '✨' },
    { id: 'bookable', name: 'Buchbares Produkt', description: 'Termine, Reservierungen', icon: '📅' }
];

export const ProductTypeSelector: React.FC = () => {
    const { productType, setProductType, setCurrentStep, completeStep } = useProductWizardStore();

    const handleSelect = (typeId: string) => {
        setProductType(typeId);
        completeStep(1);
        setCurrentStep(2);
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-2">Produktart wählen</h2>
            <p className="text-gray-600 mb-6">Wählen Sie die Art des Produkts, das Sie erstellen möchten</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PRODUCT_TYPES.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => handleSelect(type.id)}
                        className={`
              p-6 rounded-lg border-2 text-left transition-all
              ${productType === type.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                            }
            `}
                    >
                        <div className="text-4xl mb-3">{type.icon}</div>
                        <h3 className="font-semibold text-lg mb-1">{type.name}</h3>
                        <p className="text-sm text-gray-600">{type.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};
