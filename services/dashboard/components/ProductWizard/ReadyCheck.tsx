import React from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';

export const ReadyCheck: React.FC = () => {
    const { stepData, completeStep, setCurrentStep } = useProductWizardStore();

    const checks = [
        { label: 'Produktart gewählt', valid: !!stepData[1], field: 'product_type' },
        { label: 'Titel vorhanden', valid: !!stepData[2]?.title, field: 'title' },
        { label: 'SKU vorhanden', valid: !!stepData[2]?.sku, field: 'sku' },
        { label: 'Mindestens 1 Bild', valid: stepData[3]?.images?.length >= 1, field: 'images' },
        { label: 'Preis > 0', valid: stepData[4]?.price > 0, field: 'price' },
        { label: 'Bestand >= 0', valid: stepData[4]?.stock >= 0, field: 'stock' }
    ];

    const allValid = checks.every(c => c.valid);
    const validCount = checks.filter(c => c.valid).length;

    const handleNext = () => {
        completeStep(9);
        setCurrentStep(10);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-2">Bereit für Sync</h2>
            <p className="text-gray-600 mb-6">Validierung aller Pflichtfelder</p>

            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Fortschritt</h3>
                    <span className="text-sm text-gray-600">{validCount}/{checks.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${(validCount / checks.length) * 100}%` }}
                    />
                </div>
            </div>

            <div className="space-y-3 mb-6">
                {checks.map((check, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                        <span className={check.valid ? 'text-green-500' : 'text-red-500'}>
                            {check.valid ? '✅' : '❌'}
                        </span>
                        <span className={check.valid ? 'text-gray-900' : 'text-gray-500'}>
                            {check.label}
                        </span>
                    </div>
                ))}
            </div>

            {allValid && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-green-700 mb-1">🚀 Bereit für Sync</h3>
                    <p className="text-sm text-green-600">
                        Produkt ist optimal konfiguriert. Alle Pflichtfelder ausgefüllt.
                    </p>
                </div>
            )}

            <div className="flex gap-4">
                <button
                    onClick={handleNext}
                    disabled={!allValid}
                    className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-300"
                >
                    Weiter zur Vorschau
                </button>
            </div>
        </div>
    );
};
