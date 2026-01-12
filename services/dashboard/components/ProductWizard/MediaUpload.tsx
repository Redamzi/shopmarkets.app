import React, { useState, useEffect } from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';
import { UploadCloud, Image as ImageIcon, Video, X, Star, FolderOpen, Plus, PlayCircle, Loader2 } from 'lucide-react';
import { MediaLibrary } from '../MediaLibrary';
import { mediaService } from '../../services/mediaService'; // Import Service

export const MediaUpload: React.FC = () => {
    const { setStepData, stepData } = useProductWizardStore();
    // Key 3 for Media
    const savedData = stepData[3] || {};

    const [images, setImages] = useState<string[]>(savedData.images || []);
    const [video, setVideo] = useState<string | null>(savedData.video || null);

    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);

    // Sync Effects
    useEffect(() => {
        setStepData(3, { images, video });
    }, [images, video, setStepData]);

    const uploadFile = async (file: File): Promise<string | null> => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            // Call Media Service
            // Response typically contains { url: '...', ... }
            const response = await mediaService.upload(formData);

            // Robust check for URL in response
            if (response && response.url) return response.url;
            if (response && response.data && response.data.url) return response.data.url;
            if (typeof response === 'string' && response.startsWith('http')) return response;

            console.error('Upload successful but no URL returned', response);
            return null;
        } catch (error) {
            console.error('Upload failed', error);
            alert(`Upload fehlgeschlagen für ${file.name}`);
            return null;
        }
    };

    const handleFileUpload = async (files: FileList) => {
        if (images.length + files.length > 5) {
            alert('Maximal 5 Bilder erlaubt');
            return;
        }

        setUploading(true);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Video Handling
            if (file.type.startsWith('video/')) {
                if (video) {
                    alert('Nur 1 Video erlaubt (bereits vorhanden).');
                    continue;
                }
                if (file.size > 200 * 1024 * 1024) { // Increased limit for server upload (200MB)
                    alert(`${file.name} ist zu groß (max 200MB)`);
                    continue;
                }

                const url = await uploadFile(file);
                if (url) setVideo(url);
                continue;
            }

            // Image Handler
            if (file.size > 10 * 1024 * 1024) {
                alert(`${file.name} ist zu groß (max 10MB)`);
                continue;
            }

            const url = await uploadFile(file);
            if (url) {
                setImages(prev => [...prev, url].slice(0, 5));
            }
        }
        setUploading(false);
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploading(true);
            const url = await uploadFile(file);
            if (url) setVideo(url);
            setUploading(false);
        }
    };

    const handleDrop = async (e: React.DragEvent, type: 'image' | 'video' = 'image') => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;

        setUploading(true);

        if (type === 'video') {
            const vid = files.find(f => f.type.startsWith('video/'));
            if (vid) {
                const url = await uploadFile(vid);
                if (url) setVideo(url);
            }
        } else {
            const imgs = files.filter(f => f.type.startsWith('image/'));
            for (const file of imgs) {
                if (images.length >= 5) break;
                const url = await uploadFile(file);
                if (url) setImages(prev => [...prev, url]);
            }
        }
        setUploading(false);
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

    const removeVideo = () => {
        setVideo(null);
    };

    const handleLibrarySelect = (selectedFiles: any[]) => {
        const newImages = [...images];
        let newVideo = video;

        selectedFiles.forEach(file => {
            if (file.type === 'video' || file.mimeType?.startsWith('video/') || file.url?.endsWith('.mp4')) {
                newVideo = file.url;
            } else {
                if (!newImages.includes(file.url) && newImages.length < 5) {
                    newImages.push(file.url);
                }
            }
        });

        setImages(newImages);
        setVideo(newVideo);
        setIsLibraryOpen(false);
    };


    return (
        <div className="max-w-4xl mx-auto p-2 md:p-6 space-y-8">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                    <ImageIcon size={24} strokeWidth={1.5} />
                </div>
                <div>
                    <h2 className="text-xl font-bold font-serif-display text-slate-900 dark:text-white">Medien Upload</h2>
                    <p className="text-slate-500 dark:text-slate-400">Bilder & Videos für alle Kanäle.</p>
                </div>
            </div>

            {/* Media Uploads */}
            <div className="space-y-6">
                {/* Image Section */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <ImageIcon size={18} className="text-indigo-500" />
                            Produktbilder <span className="text-sm font-normal text-slate-400">({images.length}/5)</span>
                        </h3>
                    </div>

                    <div
                        onDrop={(e) => handleDrop(e, 'image')}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={`
                                relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
                                ${isDragging
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.01]'
                                : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }
                            `}
                    >
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                            className="hidden"
                            id="media-upload"
                        />

                        <div className="flex flex-col items-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${isDragging ? 'bg-indigo-100 dark:bg-indigo-800 text-indigo-600' : 'bg-white dark:bg-slate-700 text-slate-400 shadow-sm'}`}>
                                <UploadCloud size={24} strokeWidth={1.5} />
                            </div>
                            <p className="text-lg font-bold text-slate-900 dark:text-white mb-1">Bilder hier ablegen</p>
                            <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">oder</p>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <label
                                    htmlFor="media-upload"
                                    className="cursor-pointer bg-indigo-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-indigo-700 transition shadow-md shadow-indigo-200 dark:shadow-none flex items-center gap-2 text-sm"
                                >
                                    <Plus size={16} />
                                    Vom Gerät laden
                                </label>
                                <button
                                    onClick={() => setIsLibraryOpen(true)}
                                    className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-5 py-2 rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-2 shadow-sm text-sm"
                                >
                                    <FolderOpen size={16} />
                                    Aus Mediathek
                                </button>
                            </div>

                            <div className="flex gap-2 mt-6 opacity-60">
                                <span className="px-2 py-1 rounded-md bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 tracking-wide uppercase">JPG</span>
                                <span className="px-2 py-1 rounded-md bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 tracking-wide uppercase">PNG</span>
                            </div>
                        </div>

                        {uploading && (
                            <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center rounded-xl z-20">
                                <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg animate-pulse">
                                    <Loader2 size={18} className="animate-spin" />
                                    <span className="font-bold text-sm">Upload läuft...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 animate-in slide-in-from-bottom-4 duration-500">
                            {images.map((img, index) => (
                                <div key={index} className="group relative aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 dark:border-slate-700">
                                    <img src={img} alt={`Upload ${index + 1}`} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

                                    <button
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center bg-white/90 text-red-500 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all duration-200 shadow-sm translate-y-1 group-hover:translate-y-0 cursor-pointer z-10"
                                        title="Entfernen"
                                    >
                                        <X size={14} />
                                    </button>

                                    {index === 0 && (
                                        <div className="absolute bottom-1.5 left-1.5 bg-indigo-600/90 backdrop-blur-sm text-white px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-sm">
                                            <Star size={8} fill="currentColor" />
                                            Hauptbild
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Video Section */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Video size={18} className="text-pink-500" />
                        Produktvideo
                    </h3>

                    <div
                        className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center hover:border-pink-500 transition-colors bg-pink-50/10 dark:bg-pink-900/10 relative"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, 'video')}
                    >
                        {/* Upload Indicator specific to Video container */}
                        {uploading && !images.some(img => img === video) && (
                            <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center rounded-xl z-20">
                                <div className="flex items-center gap-3 p-3 bg-pink-50 dark:bg-pink-900/30 text-pink-600 rounded-lg animate-pulse">
                                    <Loader2 size={18} className="animate-spin" />
                                    <span className="font-bold text-sm">Video Upload...</span>
                                </div>
                            </div>
                        )}

                        {video ? (
                            <div className="relative w-full max-w-md mx-auto aspect-video bg-black rounded-lg overflow-hidden shadow-md border border-slate-200 dark:border-slate-700">
                                <video src={video} className="w-full h-full object-contain" controls playsInline />
                                <button
                                    onClick={removeVideo}
                                    className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-full hover:bg-red-50 transition shadow-md z-10 cursor-pointer"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center py-4">
                                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/20 text-pink-500 rounded-full flex items-center justify-center mb-3 shadow-sm">
                                    <PlayCircle size={24} />
                                </div>
                                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">Video hinzufügen</h4>
                                <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6 text-xs">
                                    Lade ein Video hoch um dein Produkt zum Leben zu erwecken. Max 200MB.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="relative">
                                        <button className="w-full px-5 py-2 bg-pink-600 text-white rounded-lg font-bold hover:bg-pink-700 transition shadow-md shadow-pink-500/20 text-sm flex items-center justify-center gap-2">
                                            <UploadCloud size={16} />
                                            Vom Gerät laden
                                        </button>
                                        <input
                                            type="file"
                                            accept="video/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={handleVideoUpload}
                                        />
                                    </div>

                                    <button
                                        onClick={() => setIsLibraryOpen(true)}
                                        className="px-5 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm text-sm flex items-center justify-center gap-2"
                                    >
                                        <FolderOpen size={16} />
                                        Aus Mediathek
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Media Library Modal */}
            {isLibraryOpen && (
                <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden relative border border-slate-200 dark:border-slate-700">
                        <div className="h-full">
                            <MediaLibrary
                                isPicker={true}
                                onClose={() => setIsLibraryOpen(false)}
                                onSelect={handleLibrarySelect}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
