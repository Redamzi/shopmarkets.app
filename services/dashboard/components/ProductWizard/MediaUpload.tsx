import React, { useState, useEffect } from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';
import { UploadCloud, Image as ImageIcon, X, Trash2, Star } from 'lucide-react';

export const MediaUpload: React.FC = () => {
    const { setStepData, stepData } = useProductWizardStore();
    // Load initial images from store if available (Key 3 matches ProductWizard expectation)
    const [images, setImages] = useState<string[]>(stepData[3]?.images || []);
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Sync to store on change
    useEffect(() => {
        setStepData(3, { images });
    }, [images, setStepData]);

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
                    setImages(prev => [...prev, ...newImages]);
                    setUploading(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileUpload(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    return (
        <div className="max-w-4xl mx-auto p-2 md:p-6">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                    <ImageIcon size={28} strokeWidth={1.5} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold font-serif-display text-slate-900 dark:text-white">Medien Upload</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Laden Sie Produktbilder hoch (max 5 Bilder, je max 5MB).</p>
                </div>
            </div>

            <div className="space-y-6">
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`
                        relative border-2 border-dashed rounded-[2rem] p-12 text-center transition-all duration-300
                        ${isDragging
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.02]'
                            : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }
                    `}
                >
                    <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                        className="hidden"
                        id="media-upload"
                    />
                    <label htmlFor="media-upload" className="cursor-pointer flex flex-col items-center">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors ${isDragging ? 'bg-indigo-100 dark:bg-indigo-800 text-indigo-600' : 'bg-white dark:bg-slate-700 text-slate-400 shadow-sm'}`}>
                            <UploadCloud size={40} strokeWidth={1.5} />
                        </div>
                        <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">Bilder hier ablegen</p>
                        <p className="text-slate-500 dark:text-slate-400 mb-4">oder klicken um auszuwählen</p>
                        <div className="flex gap-3">
                            <span className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">JPG</span>
                            <span className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">PNG</span>
                            <span className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">WEBP</span>
                        </div>
                    </label>
                </div>

                {uploading && (
                    <div className="flex items-center justify-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl animate-pulse">
                        <UploadCloud size={20} className="animate-bounce" />
                        <span className="font-bold">Bilder werden hochgeladen...</span>
                    </div>
                )}

                {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 animate-in slide-in-from-bottom-4 duration-500">
                        {images.map((img, index) => (
                            <div key={index} className="group relative aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                                <img src={img} alt={`Upload ${index + 1}`} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

                                <button
                                    onClick={() => removeImage(index)}
                                    className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/90 text-red-500 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all duration-200 shadow-sm translate-y-2 group-hover:translate-y-0"
                                    title="Entfernen"
                                >
                                    <X size={16} />
                                </button>

                                {index === 0 && (
                                    <div className="absolute bottom-2 left-2 bg-indigo-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm">
                                        <Star size={10} fill="currentColor" />
                                        Hauptbild
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
