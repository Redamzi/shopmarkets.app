import React, { useState, useEffect } from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';

export const AIGenerator: React.FC = () => {
    const { productType, aiOutput, setAIOutput, setAIUsed, setStepData, completeStep, setCurrentStep, stepData } = useProductWizardStore();
    // Initialize from store if already present (Key 2)
    const [image, setImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isEditing, setIsEditing] = useState(!!stepData[2]?.title);
    const [editableData, setEditableData] = useState<any>(stepData[2] || null);

    // Sync to store on change
    useEffect(() => {
        if (editableData) {
            setStepData(2, editableData);
        }
    }, [editableData, setStepData]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setImage(base64);
        };
        reader.readAsDataURL(file);

        // Generate directly
        generateWithAI(file);
    };

    const generateWithAI = async (file: File) => {
        setIsProcessing(true);
        try {
            const formData = new FormData();
            formData.append('image', file);

            // Allow override via Env, default to local microservice
            const AI_SERVICE_URL = (import.meta as any).env.VITE_AI_SERVICE_URL || 'http://localhost:5005';

            // ADDED: Context from selected channels (Step 2)
            const channelsData = stepData[12] || {};
            const selectedChannels = channelsData.channels || [];
            if (selectedChannels.length > 0) {
                formData.append('target_channels', JSON.stringify(selectedChannels));
                // Add a human-readable hint used by some AI prompts
                formData.append('context_hint', `Target Sales Channels: ${selectedChannels.join(', ')}`);
            }

            // Legacy Logic: Direct call to Microservice (bypassing Main API)
            const response = await fetch(`${AI_SERVICE_URL}/generate`, {
                method: 'POST',
                // Content-Type is set automatically for FormData
                body: formData
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`AI Service Error: ${response.status} ${errText}`);
            }

            const result = await response.json();

            // Legacy Response structure: { data: { ... } }
            const data = result.data;

            if (data) {
                setAIOutput(data);
                setAIUsed(true); // Flag for Credit Calculation
                setEditableData(data);
                setIsEditing(true);
            } else {
                throw new Error('No data received from AI Service');
            }
        } catch (error) {
            console.error('AI Generation failed:', error);
            alert('Fehler bei der AI Generierung. Bitte sicherstellen, dass der AI Service (Port 5005) läuft.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSkip = () => {
        setCurrentStep(3);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-2">AI Produkt-Generator</h2>
            <p className="text-gray-600 mb-6">Laden Sie ein Produktbild hoch und lassen Sie die KI die Details generieren</p>

            {!image && !isEditing && (
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
                    <button
                        onClick={handleSkip}
                        className="mt-6 text-gray-500 hover:text-gray-700 underline"
                    >
                        Überspringen
                    </button>
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
                            {image && <img src={image} alt="Uploaded" className="w-full rounded-lg" />}
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
                            value={Array.isArray(editableData.tiktok?.hashtags) ? editableData.tiktok?.hashtags?.join(' ') : (editableData.tiktok?.hashtags || '')}
                            onChange={(e) => setEditableData({
                                ...editableData,
                                tiktok: { ...editableData.tiktok, hashtags: e.target.value.split(' ').slice(0, 5) }
                            })}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="#fashion #style"
                        />
                        <p className="text-xs text-gray-500 mt-1">Max 5 Hashtags</p>
                    </div>
                </div>
            )}
        </div>
    );
};
