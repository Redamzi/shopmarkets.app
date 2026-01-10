import React, { useState } from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';

export const PreviewSave: React.FC = () => {
    const { productType, stepData, reset } = useProductWizardStore();
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const allData = {
        product_type: productType,
        ...stepData[2],
        ...stepData[3],
        ...stepData[4],
        ...stepData[5],
        ...stepData[6],
        channels: stepData[7]?.channels || []
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/product-wizard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(allData)
            });

            const result = await response.json();

            if (result.success) {
                setSaved(true);
                setTimeout(() => {
                    reset();
                    window.location.href = '/products';
                }, 2000);
            }
        } catch (error) {
            console.error('Save failed:', error);
            alert('Fehler beim Speichern');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-2">Vorschau & Speichern</h2>
            <p className="text-gray-600 mb-6">Überprüfen Sie alle Daten vor dem Speichern</p>

            <div className="space-y-6">
                <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Produktinformationen</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">Produktart:</span>
                            <span className="ml-2 font-medium">{productType}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Titel:</span>
                            <span className="ml-2 font-medium">{allData.title}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">SKU:</span>
                            <span className="ml-2 font-medium">{allData.sku}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Kategorie:</span>
                            <span className="ml-2 font-medium">{allData.category}</span>
                        </div>
                    </div>
                </div>

                <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Preis & Inventar</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">Preis:</span>
                            <span className="ml-2 font-medium">€{allData.price}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Bestand:</span>
                            <span className="ml-2 font-medium">{allData.stock}</span>
                        </div>
                    </div>
                </div>

                <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Bilder</h3>
                    <div className="grid grid-cols-4 gap-2">
                        {allData.images?.map((img: string, i: number) => (
                            <img key={i} src={img} alt={`Product ${i + 1}`} className="w-full h-24 object-cover rounded" />
                        ))}
                    </div>
                </div>

                <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Verkaufskanäle</h3>
                    <div className="flex flex-wrap gap-2">
                        {allData.channels.map((channel: string) => (
                            <span key={channel} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                {channel}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {saved && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                    <p className="text-green-700 font-semibold">✅ Produkt erfolgreich gespeichert!</p>
                </div>
            )}

            <div className="flex gap-4 mt-8">
                <button
                    onClick={handleSave}
                    disabled={isSaving || saved}
                    className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-300"
                >
                    {isSaving ? 'Speichert...' : saved ? 'Gespeichert ✓' : 'Produkt speichern'}
                </button>
            </div>
        </div>
    );
};
