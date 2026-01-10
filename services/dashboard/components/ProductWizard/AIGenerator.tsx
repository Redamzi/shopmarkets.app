import React, { useState } from 'react';
import { useProductWizardStore } from '../store/productWizardStore';

export const AIGenerator: React.FC = () => {
    const { productType, aiOutput, setAIOutput, setStepData, completeStep, setCurrentStep } = useProductWizardStore();
    const [image, setImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editableData, setEditableData] = useState<any>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setImage(base64);
            generateWithAI(base64);
        };
        reader.readAsDataURL(file);
    };

    const generateWithAI = async (imageBase64: string) => {
        setIsProcessing(true);
        try {
            const response = await fetch('/api/product-wizard/ai-generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    image: imageBase64,
                    product_type: productType
                })
            });

            const result = await response.json();

            if (result.success) {
                setAIOutput(result.data);
                setEditableData(result.data);
                setIsEditing(true);
            }
        } catch (error) {
            console.error('AI Generation failed:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSave = () => {
        setStepData(2, editableData);
        completeStep(2);
        setCurrentStep(3);
    };

    const handleSkip = () => {
        setCurrentStep(3);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-2">AI Produkt-Generator</h2>
            <p className="text-gray-600 mb-6">Laden Sie ein Produktbild hoch und lassen Sie die KI die Details generieren</p>

            {!image && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                        <div className="text-6xl mb-4">📸</div>
                        <p className="text-lg font-semibold mb-2">Bild hochladen</p>
                        <p className="text-sm text-gray-600">Klicken Sie hier oder ziehen Sie ein Bild</p>
                    </label>
                </div>
            )}

            {isProcessing && (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg font-semibold">KI analysiert Ihr Bild...</p>
                </div>
            )}

            {isEditing && editableData && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <img src={image!} alt="Uploaded" className="w-full rounded-lg" />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Titel</label>
                                <input
                                    type="text"
                                    value={editableData.title}
                                    onChange={(e) => setEditableData({ ...editableData, title: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Kurzbeschreibung</label>
                                <textarea
                                    value={editableData.short_description}
                                    onChange={(e) => setEditableData({ ...editableData, short_description: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    rows={2}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Kategorie</label>
                                <input
                                    type="text"
                                    value={editableData.category}
                                    onChange={(e) => setEditableData({ ...editableData, category: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">SKU</label>
                                <input
                                    type="text"
                                    value={editableData.sku}
                                    onChange={(e) => setEditableData({ ...editableData, sku: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Beschreibung</label>
                        <textarea
                            value={editableData.description}
                            onChange={(e) => setEditableData({ ...editableData, description: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                            rows={4}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">SEO Titel</label>
                            <input
                                type="text"
                                value={editableData.seo?.title || ''}
                                onChange={(e) => setEditableData({
                                    ...editableData,
                                    seo: { ...editableData.seo, title: e.target.value }
                                })}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">SEO Beschreibung</label>
                            <input
                                type="text"
                                value={editableData.seo?.description || ''}
                                onChange={(e) => setEditableData({
                                    ...editableData,
                                    seo: { ...editableData.seo, description: e.target.value }
                                })}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">TikTok Caption</label>
                        <input
                            type="text"
                            value={editableData.tiktok?.caption || ''}
                            onChange={(e) => setEditableData({
                                ...editableData,
                                tiktok: { ...editableData.tiktok, caption: e.target.value }
                            })}
                            className="w-full px-3 py-2 border rounded-lg"
                            maxLength={150}
                        />
                        <p className="text-xs text-gray-500 mt-1">{editableData.tiktok?.caption?.length || 0}/150</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">TikTok Hashtags</label>
                        <input
                            type="text"
                            value={editableData.tiktok?.hashtags?.join(' ') || ''}
                            onChange={(e) => setEditableData({
                                ...editableData,
                                tiktok: { ...editableData.tiktok, hashtags: e.target.value.split(' ').slice(0, 5) }
                            })}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="#fashion #style"
                        />
                        <p className="text-xs text-gray-500 mt-1">Max 5 Hashtags</p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleSave}
                            className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600"
                        >
                            Speichern & Weiter
                        </button>
                        <button
                            onClick={handleSkip}
                            className="px-6 py-3 border rounded-lg hover:bg-gray-50"
                        >
                            Überspringen
                        </button>
                    </div>
                </div>
            )}

            {!image && !isProcessing && (
                <button
                    onClick={handleSkip}
                    className="mt-4 text-blue-500 hover:underline"
                >
                    AI-Generator überspringen
                </button>
            )}
        </div>
    );
};
