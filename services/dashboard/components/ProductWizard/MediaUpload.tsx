import React, { useState, useEffect } from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';
import { UploadCloud, Image as ImageIcon, Video, X, Star, FolderOpen, Plus, PlayCircle, Share2, Hash, Music, Repeat, Scissors } from 'lucide-react';
import { MediaLibrary } from '../MediaLibrary';

export const MediaUpload: React.FC = () => {
    const { setStepData, stepData } = useProductWizardStore();
    // Key 3 for Media
    const savedData = stepData[3] || {};
    // Key 9 for TikTok (as per Controller expectation)
    const savedTiktok = stepData[9]?.tiktok || {};
    // AI Fallback
    const aiData = stepData[2] || {};

    const [images, setImages] = useState<string[]>(savedData.images || []);
    const [video, setVideo] = useState<string | null>(savedData.video || null);

    // TikTok State
    const [tiktok, setTiktok] = useState({
        caption: savedTiktok.caption || aiData.tiktok?.caption || '',
        hashtags: Array.isArray(savedTiktok.hashtags)
            ? savedTiktok.hashtags.join(' ')
            : (savedTiktok.hashtags || aiData.tiktok?.hashtags || ''),
        sound: savedTiktok.sound || '',
        duet: savedTiktok.duet !== false,
        stitch: savedTiktok.stitch !== false
    });

    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);

    // Sync Effects
    useEffect(() => {
        setStepData(3, { images, video });
    }, [images, video, setStepData]);

    useEffect(() => {
        setStepData(9, {
            ...stepData[9], // Preserve other Step 9 data (SEO)
            tiktok: {
                ...tiktok,
                hashtags: tiktok.hashtags.split(' ').filter((h: string) => h.startsWith('#')).slice(0, 5)
            }
        });
    }, [tiktok, setStepData]);

    const handleFileUpload = async (files: FileList) => {
        if (images.length + files.length > 5) {
            alert('Maximal 5 Bilder erlaubt');
            return;
        }

        setUploading(true);
        const newImages: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Check if Video
            if (file.type.startsWith('video/')) {
                if (video) {
                    alert('Nur 1 Video erlaubt (bereits vorhanden).');
                    continue;
                }
                if (file.size > 50 * 1024 * 1024) {
                    alert(`${file.name} ist zu groß (max 50MB)`);
                    continue;
                }
                const reader = new FileReader();
                reader.onloadend = () => {
                    setVideo(reader.result as string);
                    // If only video uploaded, stop loading spinner
                    if (files.length === 1) setUploading(false);
                };
                reader.readAsDataURL(file);
                continue;
            }

            // Image Handler
            if (file.size > 5 * 1024 * 1024) {
                alert(`${file.name} ist zu groß (max 5MB)`);
                continue;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                newImages.push(reader.result as string);
                // Just force update
                setImages(prev => [...prev, reader.result as string].slice(0, 5));
                setUploading(false);
            };
            reader.readAsDataURL(file);
        }
        setUploading(false); // Safety
    };

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 50 * 1024 * 1024) {
                alert(`${file.name} ist zu groß (max 50MB)`);
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setVideo(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e: React.DragEvent, type: 'image' | 'video' = 'image') => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);

        if (type === 'video') {
            const vid = files.find(f => f.type.startsWith('video/'));
            if (vid) {
                const reader = new FileReader();
                reader.onloadend = () => setVideo(reader.result as string);
                reader.readAsDataURL(vid);
            }
            return;
        }

        const imgs = files.filter(f => f.type.startsWith('image/'));
        if (imgs.length > 0) {
            imgs.forEach(file => {
                if (inputImagesCount(files.length) > 5) return;
                const reader = new FileReader();
                reader.onloadend = () => setImages(prev => [...prev, reader.result as string].slice(0, 5));
                reader.readAsDataURL(file);
            });
        }
    };

    const inputImagesCount = (newCount: number) => images.length + newCount;

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
            if (file.type === 'video' || file.mimeType?.startsWith('video/')) {
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
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                    <ImageIcon size={28} strokeWidth={1.5} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold font-serif-display text-slate-900 dark:text-white">Medien Upload & TikTok</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Bilder, Videos und Social Media Einstellungen.</p>
                </div>
            </div>

            {/* Media Uploads */}
            <div className="space-y-8">
                {/* Image Section */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <ImageIcon size={20} className="text-indigo-500" />
                            Produktbilder <span className="text-sm font-normal text-slate-400">({images.length}/5)</span>
                        </h3>
                    </div>

                    <div
                        onDrop={(e) => handleDrop(e, 'image')}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={`
                                relative border-2 border-dashed rounded-[2rem] p-8 md:p-12 text-center transition-all duration-300
                                ${isDragging
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.02]'
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
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors ${isDragging ? 'bg-indigo-100 dark:bg-indigo-800 text-indigo-600' : 'bg-white dark:bg-slate-700 text-slate-400 shadow-sm'}`}>
                                <UploadCloud size={40} strokeWidth={1.5} />
                            </div>
                            <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">Bilder hier ablegen</p>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">oder</p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <label
                                    htmlFor="media-upload"
                                    className="cursor-pointer bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2"
                                >
                                    <Plus size={18} />
                                    Vom Gerät laden
                                </label>
                                <button
                                    onClick={() => setIsLibraryOpen(true)}
                                    className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-2 shadow-sm"
                                >
                                    <FolderOpen size={18} />
                                    Aus Mediathek
                                </button>
                            </div>

                            <div className="flex gap-3 mt-8 opacity-60">
                                <span className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">JPG</span>
                                <span className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">PNG</span>
                            </div>
                        </div>

                        {uploading && (
                            <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center rounded-[2rem]">
                                <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl animate-pulse">
                                    <UploadCloud size={20} className="animate-bounce" />
                                    <span className="font-bold">Dateien werden verarbeitet...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-8 animate-in slide-in-from-bottom-4 duration-500">
                            {images.map((img, index) => (
                                <div key={index} className="group relative aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700">
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

                {/* Video Section */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Video size={20} className="text-pink-500" />
                        Social Media Video (9:16)
                    </h3>

                    <div
                        className="border-3 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center hover:border-pink-500 transition-colors bg-pink-50/10 dark:bg-pink-900/10"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, 'video')}
                    >
                        {video ? (
                            <div className="relative w-full max-w-xs mx-auto aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
                                <video src={video} className="w-full h-full object-cover" controls />
                                <button
                                    onClick={removeVideo}
                                    className="absolute top-4 right-4 p-2 bg-white/90 text-red-500 rounded-full hover:bg-red-50 transition shadow-md z-10"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center py-6">
                                <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/20 text-pink-500 rounded-full flex items-center justify-center mb-4 shadow-sm">
                                    <PlayCircle size={32} />
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Video hochladen</h4>
                                <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6 text-sm">
                                    Ideal für TikTok, Reels oder YouTube Shorts. Max 50MB.
                                </p>
                                <div className="relative">
                                    <button className="px-6 py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition shadow-lg shadow-pink-500/20">
                                        Video auswählen
                                    </button>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleVideoUpload}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* TikTok Integration Section */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-6 duration-500">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Share2 size={20} className="text-pink-500" />
                        TikTok Einstellungen
                    </h3>

                    <div className="space-y-6">
                        <div className="group">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Caption</label>
                            <div className="relative">
                                <textarea
                                    value={tiktok.caption}
                                    onChange={(e) => setTiktok({ ...tiktok, caption: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all outline-none min-h-[80px]"
                                    maxLength={150}
                                    placeholder="Spannende Caption für TikTok..."
                                />
                                <span className="absolute right-4 bottom-4 text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                                    {tiktok.caption.length}/150
                                </span>
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                <Hash size={16} className="text-pink-500" />
                                Hashtags
                            </label>
                            <input
                                type="text"
                                value={tiktok.hashtags}
                                onChange={(e) => setTiktok({ ...tiktok, hashtags: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all outline-none"
                                placeholder="#fashion #style #trending"
                            />
                            <p className="text-xs text-slate-400 mt-2 px-1">Maximal 5 Hashtags, beginnend mit #</p>
                        </div>

                        <div className="group">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                <Music size={16} className="text-pink-500" />
                                Sound / Audio (Link oder Name)
                            </label>
                            <input
                                type="text"
                                value={tiktok.sound}
                                onChange={(e) => setTiktok({ ...tiktok, sound: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all outline-none"
                                placeholder="z.B. Trending Sound - Artist"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Duet Toggle */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-pink-200 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center text-pink-500 shadow-sm border border-slate-100 dark:border-slate-600">
                                        <Repeat size={20} />
                                    </div>
                                    <div>
                                        <label htmlFor="duet" className="block text-lg font-bold text-slate-900 dark:text-white cursor-pointer">Duet erlauben</label>
                                    </div>
                                </div>
                                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id="duet"
                                        className="absolute w-12 h-6 opacity-0 cursor-pointer z-10"
                                        checked={tiktok.duet}
                                        onChange={(e) => setTiktok({ ...tiktok, duet: e.target.checked })}
                                    />
                                    <div className={`w-12 h-6 rounded-full shadow-inner transition-colors ${tiktok.duet ? 'bg-pink-600' : 'bg-slate-300'}`}></div>
                                    <div className={`absolute left-0 top-0 w-6 h-6 bg-white rounded-full shadow transform transition-transform ${tiktok.duet ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </div>
                            </div>

                            {/* Stitch Toggle */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-pink-200 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center text-pink-500 shadow-sm border border-slate-100 dark:border-slate-600">
                                        <Scissors size={20} />
                                    </div>
                                    <div>
                                        <label htmlFor="stitch" className="block text-lg font-bold text-slate-900 dark:text-white cursor-pointer">Stitch erlauben</label>
                                    </div>
                                </div>
                                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id="stitch"
                                        className="absolute w-12 h-6 opacity-0 cursor-pointer z-10"
                                        checked={tiktok.stitch}
                                        onChange={(e) => setTiktok({ ...tiktok, stitch: e.target.checked })}
                                    />
                                    <div className={`w-12 h-6 rounded-full shadow-inner transition-colors ${tiktok.stitch ? 'bg-pink-600' : 'bg-slate-300'}`}></div>
                                    <div className={`absolute left-0 top-0 w-6 h-6 bg-white rounded-full shadow transform transition-transform ${tiktok.stitch ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </div>
                            </div>
                        </div>
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
