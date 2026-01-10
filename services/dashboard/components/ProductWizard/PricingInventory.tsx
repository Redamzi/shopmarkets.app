import React, { useState } from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';

export const PricingInventory: React.FC = () => {
    const { setStepData, completeStep, setCurrentStep } = useProductWizardStore();
    const [price, setPrice] = useState('');
    const [comparePrice, setComparePrice] = useState('');
    const [stock, setStock] = useState('');
    const [stockAlert, setStockAlert] = useState('');

    const handleNext = () => {
        if (!price || parseFloat(price) <= 0) {
            alert('Preis muss größer als 0 sein');
            return;
        }
        if (!stock || parseInt(stock) < 0) {
            alert('Bestand muss mindestens 0 sein');
            return;
        }

        setStepData(4, {
            price: parseFloat(price),
            compare_price: comparePrice ? parseFloat(comparePrice) : null,
            stock: parseInt(stock),
            stock_alert: stockAlert ? parseInt(stockAlert) : null
        });
        completeStep(4);
        setCurrentStep(5);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-2">Preise & Inventar</h2>
            <p className="text-gray-600 mb-6">Legen Sie Preise und Bestandsinformationen fest</p>

            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Preis <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-500">€</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 border rounded-lg"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Vergleichspreis</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-500">€</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={comparePrice}
                                onChange={(e) => setComparePrice(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 border rounded-lg"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Bestand <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Bestandswarnung</label>
                        <input
                            type="number"
                            min="0"
                            value={stockAlert}
                            onChange={(e) => setStockAlert(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="5"
                        />
                        <p className="text-xs text-gray-500 mt-1">Warnung bei niedrigem Bestand</p>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">💡 Preis-Radar</h3>
                    <p className="text-sm text-gray-700">Konkurrenzanalyse läuft...</p>
                    <p className="text-sm text-gray-600 mt-1">Empfohlener Preis: €{price || '0.00'}</p>
                </div>
            </div>

            <div className="flex gap-4 mt-8">
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
