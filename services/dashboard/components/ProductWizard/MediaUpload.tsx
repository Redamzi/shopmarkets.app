import React, { useState } from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';

export const MediaUpload: React.FC = () => {
    const { setStepData, completeStep, setCurrentStep } = useProductWizardStore();
    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (files: FileList) => {
        if (images.length + files.length > 5) {
            alert('Maximal 5 Bilder erlaubt');
            return;
        }

        setUploading(true);
        const newImages: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.size > 5 * 1024 * 1024) {
                alert(`${file.name} ist zu groß (max 5MB)`);
                continue;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                newImages.push(reader.result as string);
                if (newImages.length === files.length) {
                    setImages([...images, ...newImages]);
                    setUploading(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        handleFileUpload(e.dataTransfer.files);
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleNext = () => {
        if (images.length === 0) {
            alert('Mindestens 1 Bild erforderlich');
            return;
        }
        setStepData(3, { images });
        completeStep(3);
        setCurrentStep(4);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-2">Medien Upload</h2>
            <p className="text-gray-600 mb-6">Laden Sie Produktbilder hoch (max 5 Bilder, je max 5MB)</p>

            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center mb-6"
            >
                <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    className="hidden"
                    id="media-upload"
                />
                <label htmlFor="media-upload" className="cursor-pointer">
                    <div className="text-6xl mb-4">📁</div>
                    <p className="text-lg font-semibold mb-2">Bilder hochladen</p>
                    <p className="text-sm text-gray-600">Klicken oder Drag & Drop</p>
                    <p className="text-xs text-gray-500 mt-2">JPG, PNG, WEBP - max 5MB pro Bild</p>
                </label>
            </div>

            {uploading && <p className="text-center text-blue-500 mb-4">Uploading...</p>}

            <div className="grid grid-cols-3 gap-4 mb-6">
                {images.map((img, index) => (
                    <div key={index} className="relative group">
                        <img src={img} alt={`Upload ${index + 1}`} className="w-full h-48 object-cover rounded-lg" />
                        <button
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition"
                        >
                            ×
                        </button>
                        {index === 0 && (
                            <div className="absolute bottom-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                                Hauptbild
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex gap-4">
                <button
                    onClick={handleNext}
                    disabled={images.length === 0}
                    className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-300"
                >
                    Weiter
                </button>
            </div>
        </div>
    );
};
