import React, { useState, useEffect } from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';

export const PricingInventory: React.FC = () => {
    const { setStepData, stepData } = useProductWizardStore();

    // Load initial data from Store Key 6 (Price) and Key 7 (Stock)
    const priceData = stepData[6] || {};
    const stockData = stepData[7] || {};

    const [price, setPrice] = useState(priceData.price || '');
    const [comparePrice, setComparePrice] = useState(priceData.compare_price || '');
    const [stock, setStock] = useState(stockData.quantity || '');
    const [stockAlert, setStockAlert] = useState(stockData.lowStockThreshold || '');

    // Sync Price to Key 6
    useEffect(() => {
        setStepData(6, {
            ...priceData,
            price: parseFloat(price) || 0,
            compare_price: comparePrice ? parseFloat(comparePrice) : null
        });
    }, [price, comparePrice, setStepData]);

    // Sync Stock to Key 7
    useEffect(() => {
        setStepData(7, {
            ...stockData,
            quantity: parseInt(stock) || 0,
            lowStockThreshold: stockAlert ? parseInt(stockAlert) : null
        });
    }, [stock, stockAlert, setStepData]);

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
        </div>
    );
};
