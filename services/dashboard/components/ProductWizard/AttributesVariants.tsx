import React, { useState } from 'react';
import { useProductWizardStore } from '../store/productWizardStore';

export const AttributesVariants: React.FC = () => {
    const { productType, setStepData, completeStep, setCurrentStep } = useProductWizardStore();
    const [attributes, setAttributes] = useState({
        material: '',
        color: '',
        size: '',
        weight: ''
    });
    const [variants, setVariants] = useState<any[]>([]);

    const needsVariants = ['configurable', 'bundle', 'personalized'].includes(productType || '');

    const addVariant = () => {
        setVariants([...variants, { name: '', values: '', sku: '', price: '' }]);
    };

    const updateVariant = (index: number, field: string, value: string) => {
        const updated = [...variants];
        updated[index][field] = value;
        setVariants(updated);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const handleNext = () => {
        setStepData(5, {
            attributes,
            variants: variants.map(v => ({
                name: v.name,
                values: v.values.split(',').map((s: string) => s.trim()),
                sku: v.sku,
                price: parseFloat(v.price) || 0
            }))
        });
        completeStep(5);
        setCurrentStep(6);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-2">Attribute & Varianten</h2>
            <p className="text-gray-600 mb-6">Produkteigenschaften und Varianten definieren</p>

            <div className="space-y-6">
                <div>
                    <h3 className="font-semibold mb-4">Attribute</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Material</label>
                            <input
                                type="text"
                                value={attributes.material}
                                onChange={(e) => setAttributes({ ...attributes, material: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                                placeholder="z.B. Baumwolle"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Farbe</label>
                            <input
                                type="text"
                                value={attributes.color}
                                onChange={(e) => setAttributes({ ...attributes, color: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                                placeholder="z.B. Schwarz"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Größe</label>
                            <input
                                type="text"
                                value={attributes.size}
                                onChange={(e) => setAttributes({ ...attributes, size: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                                placeholder="z.B. M, L, XL"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Gewicht</label>
                            <input
                                type="text"
                                value={attributes.weight}
                                onChange={(e) => setAttributes({ ...attributes, weight: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                                placeholder="z.B. 1.2kg"
                            />
                        </div>
                    </div>
                </div>

                {needsVariants && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold">Varianten</h3>
                            <button
                                onClick={addVariant}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600"
                            >
                                + Variante hinzufügen
                            </button>
                        </div>

                        {variants.map((variant, index) => (
                            <div key={index} className="border rounded-lg p-4 mb-4">
                                <div className="grid grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Name</label>
                                        <input
                                            type="text"
                                            value={variant.name}
                                            onChange={(e) => updateVariant(index, 'name', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-lg"
                                            placeholder="z.B. Größe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Werte</label>
                                        <input
                                            type="text"
                                            value={variant.values}
                                            onChange={(e) => updateVariant(index, 'values', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-lg"
                                            placeholder="M, L, XL"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">SKU</label>
                                        <input
                                            type="text"
                                            value={variant.sku}
                                            onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-lg"
                                            placeholder="SKU-001"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Preis</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={variant.price}
                                                onChange={(e) => updateVariant(index, 'price', e.target.value)}
                                                className="flex-1 px-3 py-2 border rounded-lg"
                                                placeholder="0.00"
                                            />
                                            <button
                                                onClick={() => removeVariant(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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
