import React, { useState, useEffect, useRef } from 'react';
import {
    Image as ImageIcon, Film, File, Trash2, Upload, Grid, List,
    MoreVertical, Folder, Star, Clock, FolderPlus, Search,
    CheckCircle, AlertCircle, RefreshCw, X, Download, ChevronLeft, ChevronRight, BookOpen, FileText, GripVertical
} from 'lucide-react';
import { mediaService } from '../services/mediaService';

// Interfaces
interface MediaFile {
    id: string;
    filename: string;
    type: string;
    size_bytes: number;
    url: string;
    is_active: boolean;
    folder_id: string | null;
    created_at: string;
}

interface MediaFolder {
    id: string;
    name: string;
    user_id: string;
}

interface MediaLibraryProps {
    isPicker?: boolean;
    onSelect?: (files: MediaFile[]) => void;
    onClose?: () => void;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({ isPicker = false, onSelect, onClose }) => {
    // State
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [folders, setFolders] = useState<MediaFolder[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Selection State
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null); // null = All Media
    const [showInactive, setShowInactive] = useState(false);

    // UI State
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Modals
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [selectionMode, setSelectionMode] = useState(isPicker); // Default to selection mode if picker

    // Drag state
    const [isDragging, setIsDragging] = useState(false);
    const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(undefined); // undefined = none, null = All Media

    // File Input Ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    const toggleSelection = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newSelected = new Set(selectedItems);
        // If picker and NOT multi-select (logic can be refined, but for now allow multi)
        // If we want single select for picker? Let's user decide via selectedItems logic.
        // For product image usually single, but gallery multiple. Let's support multiple and let parent decide.

        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedItems(newSelected);
    };

    const handleConfirmSelection = () => {
        if (onSelect) {
            const selectedFiles = files.filter(f => selectedItems.has(f.id));
            onSelect(selectedFiles);
        }
    };

    // ... (rest of methods)

    const handleBulkDelete = async () => {
        if (!confirm(`Möchten Sie ${selectedItems.size} Dateien wirklich löschen?`)) return;

        try {
            // Delete sequentially or parallel
            setLoading(true);
            const promises = Array.from(selectedItems).map(id => mediaService.delete(id));
            await Promise.all(promises);
            setSelectedItems(new Set());
            await loadData();
        } catch (error) {
            console.error('Bulk delete failed:', error);
            alert('Fehler beim Löschen einiger Dateien.');
        } finally {
            setLoading(false);
        }
    };

    // Drag & Drop Handlers (Keep existing logic)
    const handleDragStart = (e: React.DragEvent, fileId: string) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('fileId', fileId);
        setIsDragging(true);
        console.log('🎯 Drag started:', fileId);

        // Custom Drag Image for Multi-Selection
        if (selectedItems.has(fileId) && selectedItems.size > 1) {
            const dragIcon = document.createElement('div');
            dragIcon.className = 'bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-xl font-bold border-2 border-white z-50 fixed top-[-1000px] left-[-1000px]';
            dragIcon.innerText = `${selectedItems.size} Dateien`;
            document.body.appendChild(dragIcon);
            e.dataTransfer.setDragImage(dragIcon, 0, 0);

            // Cleanup after a short delay (browser takes snapshot)
            setTimeout(() => document.body.removeChild(dragIcon), 0);
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        console.log('🏁 Drag ended');
    };

    const handleDragOver = (e: React.DragEvent, folderId: string | null) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        if (dragOverFolderId !== folderId) {
            setDragOverFolderId(folderId);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e: React.DragEvent, targetFolderId: string | null) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverFolderId(undefined); // Clear highlight
        const fileId = e.dataTransfer.getData('fileId');

        if (!fileId) {
            console.warn('No fileId in drop event');
            setIsDragging(false);
            return;
        }

        // Determine if we are moving a single file or a selection
        const filesToMove: string[] = [];

        if (selectedItems.has(fileId)) {
            // If the dragged file is part of the selection, move all selected files
            selectedItems.forEach(id => filesToMove.push(id));
        } else {
            // Otherwise just move the single file
            filesToMove.push(fileId);
        }

        console.log(`📦 Moving ${filesToMove.length} files to folder:`, targetFolderId);

        try {
            setLoading(true);

            // Execute moves in parallel
            const movePromises = filesToMove.map(id => {
                // Check if file is already in target (skip if so)
                const file = files.find(f => f.id === id);
                if (file && file.folder_id === targetFolderId) {
                    return Promise.resolve();
                }
                return mediaService.moveFile(id, targetFolderId);
            });

            await Promise.all(movePromises);
            console.log('✅ Move successful');

            // Clear selection if we moved selected items
            if (selectedItems.has(fileId)) {
                setSelectedItems(new Set());
                if (!isPicker) setSelectionMode(false); // Only exit selection mode if not picker
            }

            await loadData();
        } catch (error: any) {
            console.error('❌ Move failed:', error);
            alert(`Fehler beim Verschieben: ${error?.response?.data?.error || error.message}`);
        } finally {
            setLoading(false);
            setIsDragging(false);
        }
    };



    const loadData = async () => {
        try {
            setLoading(true);
            const [filesData, foldersData] = await Promise.all([
                mediaService.getAll(),
                mediaService.getFolders()
            ]);
            setFiles(filesData);
            setFolders(foldersData);
        } catch (e) {
            console.error("Failed to load media data", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            if (selectedFolderId) {
                formData.append('folderId', selectedFolderId);
            }

            await mediaService.upload(formData);
            console.log('Upload successful');
            await loadData();
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload fehlgeschlagen. Bitte versuchen Sie es erneut.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (e: React.MouseEvent | null, id: string) => {
        if (e) e.stopPropagation();
        if (!confirm('Möchten Sie diese Datei wirklich löschen?')) return;

        try {
            await mediaService.delete(id);
            if (previewFile && previewFile.id === id) setPreviewFile(null);
            await loadData();
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Löschen fehlgeschlagen.');
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        try {
            await mediaService.createFolder(newFolderName);
            setNewFolderName('');
            setIsCreateFolderOpen(false);
            await loadData();
        } catch (error) {
            console.error('Create folder failed:', error);
            alert('Ordner konnte nicht erstellt werden.');
        }
    };

    const handleDeleteFolder = async (folderId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Ordner wirklich löschen? Inhalte werden NICHT gelöscht, sondern in "Alle Medien" verschoben.')) return;
        try {
            await mediaService.deleteFolder(folderId);
            if (selectedFolderId === folderId) setSelectedFolderId(null);
            await loadData();
        } catch (error) {
            console.error('Delete folder failed:', error);
            alert('Ordner konnte nicht gelöscht werden.');
        }
    };

    const filteredFiles = files.filter(file => {
        if (showInactive) return !file.is_active;
        if (selectedFolderId === null) return file.is_active;
        return file.folder_id === selectedFolderId && file.is_active;
    });

    // Helper to format bytes
    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Helper to determine file type properly (fallback to extension)
    const getFileType = (file: MediaFile) => {
        if (file.type) return file.type;
        const ext = file.filename.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') return 'application/pdf';
        if (ext === 'epub') return 'application/epub+zip';
        if (['mp4', 'webm', 'mov'].includes(ext || '')) return 'video/mp4';
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return 'image/jpeg';
        return 'unknown'; // don't assume image
    };

    // Helper to render file thumbnail
    const renderFileThumbnail = (file: MediaFile, size: 'small' | 'large' = 'large') => {
        const iconSize = size === 'small' ? 16 : 32;
        const type = getFileType(file);

        if (type === 'application/pdf') {
            return (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-2xl">
                    <FileText size={iconSize} className="text-red-600 dark:text-red-400 mb-1" />
                    {size === 'large' && <span className="text-[10px] font-medium text-red-600 dark:text-red-400">PDF</span>}
                </div>
            );
        }

        if (type === 'application/epub+zip') {
            return (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl">
                    <BookOpen size={iconSize} className="text-green-600 dark:text-green-400 mb-1" />
                    {size === 'large' && <span className="text-[10px] font-medium text-green-600 dark:text-green-400">EPUB</span>}
                </div>
            );
        }

        if (type.startsWith('video')) {
            return (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl">
                    <Film size={iconSize} className="text-white opacity-70 mb-1" />
                    {size === 'large' && <span className="text-[10px] font-medium text-white opacity-70">VIDEO</span>}
                </div>
            );
        }

        if (type.startsWith('image')) {
            return <img src={file.url} alt={file.filename} className="w-full h-full object-cover transition-transform group-hover:scale-105" />;
        }

        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <File size={iconSize} className="text-slate-400" />
            </div>
        );
    };

    const currentFolderName = selectedFolderId
        ? folders.find(f => f.id === selectedFolderId)?.name || 'Unbekannter Ordner'
        : 'Alle Medien';

    // Gallery Navigation Logic
    const handleNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!previewFile) return;
        const currentIndex = filteredFiles.findIndex(f => f.id === previewFile.id);
        if (currentIndex === -1) return;
        const nextIndex = (currentIndex + 1) % filteredFiles.length;
        setPreviewFile(filteredFiles[nextIndex]);
    };

    const handlePrev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!previewFile) return;
        const currentIndex = filteredFiles.findIndex(f => f.id === previewFile.id);
        if (currentIndex === -1) return;
        const prevIndex = (currentIndex - 1 + filteredFiles.length) % filteredFiles.length;
        setPreviewFile(filteredFiles[prevIndex]);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!previewFile) return;
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Escape') setPreviewFile(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [previewFile, filteredFiles]);


    return (
        <div className={`w-full mx-auto flex flex-col animate-fade-in-up relative ${isPicker ? 'h-full' : 'p-6 lg:p-10 h-[calc(100vh-100px)]'}`}>

            {/* Picker Header / Actions */}
            {isPicker && (
                <div className="flex justify-between items-center mb-4 px-1">
                    <h2 className="text-xl font-bold dark:text-white">Medien auswählen</h2>
                    <div className="flex gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                            accept="image/*,video/*,application/pdf,application/epub+zip"
                        />
                        <button
                            onClick={handleUploadClick}
                            disabled={uploading}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium disabled:opacity-50"
                        >
                            {uploading ? <RefreshCw className="animate-spin" size={16} /> : <Upload size={16} />}
                            <span className="hidden sm:inline">{uploading ? 'Lädt...' : 'Hochladen'}</span>
                        </button>
                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                        <button onClick={onClose} className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Abbrechen</button>
                        <button
                            onClick={handleConfirmSelection}
                            disabled={selectedItems.size === 0}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 font-bold"
                        >
                            Übernehmen ({selectedItems.size})
                        </button>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {previewFile && (
                <div className="fixed inset-0 z-50 bg-white/95 dark:bg-slate-900/95 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" onClick={() => setPreviewFile(null)}>

                    {/* Navigation Buttons */}
                    {filteredFiles.length > 1 && (
                        <>
                            <button
                                onClick={handlePrev}
                                className="absolute left-4 md:left-10 p-3 bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-slate-800 rounded-full backdrop-blur-md transition-all z-50 group shadow-sm border border-slate-200 dark:border-slate-700"
                            >
                                <ChevronLeft size={28} className="text-slate-600 dark:text-slate-300 group-hover:scale-110 transition-transform" />
                            </button>
                            <button
                                onClick={handleNext}
                                className="absolute right-4 md:right-10 p-3 bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-slate-800 rounded-full backdrop-blur-md transition-all z-50 group shadow-sm border border-slate-200 dark:border-slate-700"
                            >
                                <ChevronRight size={28} className="text-slate-600 dark:text-slate-300 group-hover:scale-110 transition-transform" />
                            </button>
                        </>
                    )}

                    <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setPreviewFile(null)}
                            className="absolute -top-12 right-0 md:top-0 md:-right-16 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors flex items-center gap-2 bg-white/50 dark:bg-black/50 p-2 rounded-full backdrop-blur-sm"
                        >
                            <X size={24} /> <span className="md:hidden">Schließen</span>
                        </button>


                        {(() => {
                            const type = getFileType(previewFile);
                            if (type.startsWith('image')) {
                                return <img src={previewFile.url} className="max-w-full max-h-[80vh]" />;
                            }
                            if (type === 'application/pdf') {
                                return (
                                    <div className="w-full h-[80vh] flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg border border-red-200 dark:border-red-800">
                                        <FileText size={64} className="text-red-600 dark:text-red-400 mb-4" />
                                        <p className="text-red-700 dark:text-red-300 font-medium mb-2 text-xl">PDF Dokument</p>
                                        <p className="text-sm text-red-600 dark:text-red-400 mb-2">{previewFile.filename}</p>
                                        <p className="text-xs text-red-500 dark:text-red-500 mb-6">{formatSize(previewFile.size_bytes)}</p>
                                        <div className="flex gap-3">
                                            <a
                                                href={previewFile.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all flex items-center gap-2 font-medium shadow-lg"
                                            >
                                                <FileText size={18} />
                                                PDF öffnen
                                            </a>
                                            <a
                                                href={previewFile.url}
                                                download
                                                className="px-6 py-3 bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2 font-medium"
                                            >
                                                <Download size={18} />
                                                Download
                                            </a>
                                        </div>
                                    </div>
                                );
                            }

                            if (type === 'application/pdf') {
                                return (
                                    <div className="w-full h-[80vh] bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 relative group">
                                        <iframe
                                            src={previewFile.url}
                                            title="PDF Preview"
                                            className="w-full h-full"
                                        />

                                        {/* Overlay Buttons (visible on hover) */}
                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-2 rounded-xl backdrop-blur-sm">
                                            <button
                                                onClick={(e) => handleDelete(null, previewFile.id)}
                                                className="px-4 py-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                                            >
                                                <Trash2 size={16} /> Löschen
                                            </button>
                                            <a
                                                href={previewFile.url}
                                                download
                                                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                                            >
                                                <Download size={16} /> Download
                                            </a>
                                        </div>
                                    </div>
                                );
                            }

                            if (type === 'application/epub+zip') {
                                return (
                                    <div className="w-full h-[80vh] bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 relative group">
                                        <div className="w-full h-full flex flex-col items-center justify-center">
                                            <BookOpen size={64} className="text-green-600 dark:text-green-400 mb-4" />
                                            <p className="text-green-700 dark:text-green-300 font-medium mb-2 text-xl">EPUB E-Book</p>
                                            <p className="text-sm text-green-600 dark:text-green-400 mb-2">{previewFile.filename}</p>
                                            <p className="text-xs text-green-500 mb-6">{formatSize(previewFile.size_bytes)}</p>
                                            <a href={previewFile.url} download className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all flex items-center gap-2 font-medium shadow-lg">
                                                <Download size={18} /> Download & Öffnen
                                            </a>
                                        </div>

                                        {/* Overlay Buttons (visible on hover) */}
                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-2 rounded-xl backdrop-blur-sm">
                                            <button
                                                onClick={(e) => handleDelete(null, previewFile.id)}
                                                className="px-4 py-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                                            >
                                                <Trash2 size={16} /> Löschen
                                            </button>
                                            <a
                                                href={previewFile.url}
                                                download
                                                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                                            >
                                                <Download size={16} /> Download
                                            </a>
                                        </div>
                                    </div>
                                );
                            }

                            if (type.startsWith('video')) {
                                return (
                                    <div className="relative group w-full h-full flex items-center justify-center">
                                        <video
                                            src={previewFile.url}
                                            controls
                                            className="max-w-full max-h-[80vh] rounded-lg shadow-2xl"
                                        />
                                        {/* Buttons für Video auch unterhalb oder overlay */}
                                        <div className="absolute bottom-[-60px] flex gap-4">
                                            <button
                                                onClick={(e) => handleDelete(null, previewFile.id)}
                                                className="px-6 py-2.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/30 rounded-xl transition-all flex items-center gap-2 font-medium"
                                            >
                                                <Trash2 size={18} /> Löschen
                                            </button>
                                            <a href={previewFile.url} download className="px-6 py-2.5 bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700 rounded-xl transition-all flex items-center gap-2 font-medium">
                                                <Download size={18} /> Download
                                            </a>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div className="bg-slate-100 dark:bg-slate-800 p-20 rounded-2xl text-slate-500 dark:text-slate-400 flex flex-col items-center gap-4 border border-slate-200 dark:border-slate-700">
                                    <File size={48} />
                                    <p>Vorschau für diesen Dateityp nicht verfügbar</p>
                                    <div className="flex gap-4 mt-4">
                                        <button onClick={(e) => handleDelete(null, previewFile.id)} className="text-red-500 hover:text-red-700 flex items-center gap-2"><Trash2 size={16} /> Löschen</button>
                                        <a href={previewFile.url} download className="text-indigo-500 hover:text-indigo-700 flex items-center gap-2"><Download size={16} /> Download</a>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Global Buttons only for Images (others have custom layouts) */}
                        {(() => {
                            const type = getFileType(previewFile);
                            if (type.startsWith('image')) {
                                return (
                                    <div className="mt-8 flex gap-4">
                                        <button
                                            onClick={(e) => handleDelete(null, previewFile.id)}
                                            className="px-6 py-2.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/30 rounded-xl transition-all flex items-center gap-2 font-medium"
                                        >
                                            <Trash2 size={18} />
                                            Löschen
                                        </button>
                                        <a href={previewFile.url} download target="_blank" className="px-6 py-2.5 bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700 rounded-xl transition-all flex items-center gap-2 font-medium">
                                            <Upload size={18} className="rotate-180" />
                                            Download
                                        </a>
                                    </div>
                                )
                            }
                            return null;
                        })()}
                    </div>
                </div>
            )
            }

            {/* Create Folder Modal */}
            {
                isCreateFolderOpen && (
                    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setIsCreateFolderOpen(false)}>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
                            <h3 className="text-lg font-bold mb-4 dark:text-white">Neuen Ordner erstellen</h3>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Ordnername..."
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 mb-4 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                            />
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setIsCreateFolderOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Abbrechen</button>
                                <button onClick={handleCreateFolder} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Erstellen</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Header */}
            {!isPicker && (
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold font-serif-display text-slate-900 dark:text-white">Medien <span className="text-xs text-slate-300 font-sans font-normal opacity-50">v2.0</span></h1>
                        <p className="text-slate-500 mt-1">Verwalte Bilder, Videos und Dokumente.</p>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                            accept="image/*,video/*,application/pdf,application/epub+zip"
                        />
                        <button
                            onClick={handleUploadClick}
                            disabled={uploading}
                            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-shadow shadow-lg shadow-indigo-200 dark:shadow-none font-medium disabled:opacity-50 disabled:cursor-wait"
                        >
                            {uploading ? <RefreshCw className="animate-spin" size={18} /> : <Upload size={18} />}
                            <span>{uploading ? 'Lädt hoch...' : 'Hochladen'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Main Layout */}
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex">

                {/* Sidebar */}
                <div className="w-64 bg-slate-50/50 dark:bg-slate-800/30 border-r border-slate-100 dark:border-slate-800 p-6 flex flex-col">
                    <div className="mb-6">
                        <button className="w-full flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 font-medium hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm">
                            <Search size={18} />
                            <span className="text-sm">Suchen...</span>
                        </button>
                    </div>

                    <button
                        onClick={() => setIsCreateFolderOpen(true)}
                        className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium hover:opacity-90 transition-all shadow-md"
                    >
                        <FolderPlus size={18} />
                        <span>Neuer Ordner</span>
                    </button>

                    <div className="space-y-1 flex-1 overflow-y-auto custom-scrollbar-hide">
                        <div className="flex items-center justify-between mb-2 px-3">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ordner</div>
                        </div>

                        {/* All Media Button */}
                        <button
                            onClick={() => { setSelectedFolderId(null); setShowInactive(false); }}
                            onDragOver={(e) => handleDragOver(e, null)}
                            onDragLeave={() => setDragOverFolderId(undefined)}
                            onDrop={(e) => handleDrop(e, null)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 border border-transparent ${dragOverFolderId === null
                                ? 'bg-indigo-100 border-indigo-300 scale-105 shadow-md z-10'
                                : (selectedFolderId === null && !showInactive
                                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 font-medium'
                                    : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800')
                                }`}
                        >
                            <Folder size={18} className={selectedFolderId === null && !showInactive ? 'fill-indigo-200 text-indigo-500' : 'text-slate-400'} />
                            Alle Medien
                        </button>

                        {/* Dynamic Folders */}
                        {folders.map(folder => (
                            <button
                                key={folder.id}
                                onClick={() => { setSelectedFolderId(folder.id); setShowInactive(false); }}
                                onDragOver={(e) => handleDragOver(e, folder.id)}
                                onDragLeave={() => setDragOverFolderId(undefined)}
                                onDrop={(e) => handleDrop(e, folder.id)}
                                className={`group w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 border border-transparent ${dragOverFolderId === folder.id
                                    ? 'bg-indigo-100 border-indigo-300 scale-105 shadow-md z-10'
                                    : (selectedFolderId === folder.id && !showInactive
                                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 font-medium'
                                        : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800')
                                    }`}
                            >
                                <div className="flex items-center gap-3 overflow-hidden pointer-events-none">
                                    <Folder size={18} className={selectedFolderId === folder.id && !showInactive ? 'fill-indigo-200 text-indigo-500' : 'text-slate-400'} />
                                    <span className="truncate">{folder.name}</span>
                                </div>
                                <div
                                    onClick={(e) => handleDeleteFolder(folder.id, e)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity pointer-events-auto"
                                >
                                    <Trash2 size={14} />
                                </div>
                            </button>
                        ))}

                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-6 mb-2 px-3">Filter</div>
                        <button
                            onClick={() => setShowInactive(true)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${showInactive ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 font-medium' : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        >
                            <AlertCircle size={18} className={showInactive ? 'text-amber-500' : 'text-slate-400'} />
                            Inaktiv / Ungenutzt
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col">

                    {/* Toolbar */}
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            {selectedItems.size > 0 ? (
                                <div className="flex items-center gap-4">
                                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                        {selectedItems.size} ausgewählt
                                    </span>
                                    <button
                                        onClick={handleBulkDelete}
                                        className="text-red-500 hover:text-red-700 flex items-center gap-1.5 px-3 py-1 bg-red-50 dark:bg-red-900/20 rounded-md transition-colors"
                                    >
                                        <Trash2 size={16} /> Löschen
                                    </button>
                                    <button
                                        onClick={() => setSelectedItems(new Set())}
                                        className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                                    >
                                        Abbrechen
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        {showInactive ? 'Inaktive Dateien' : currentFolderName}
                                    </span>
                                    <span>•</span>
                                    <span>{filteredFiles.length} Elemente</span>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    setSelectionMode(!selectionMode);
                                    if (selectionMode) setSelectedItems(new Set());
                                }}
                                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${selectionMode ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                            >
                                <CheckCircle size={18} />
                                {selectionMode ? 'Fertig' : 'Auswählen'}
                            </button>
                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-400'}`}
                                >
                                    <Grid size={18} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-400'}`}
                                >
                                    <List size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Files Grid/List */}
                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/50">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                {filteredFiles.map(file => (
                                    <div key={file.id} className="group relative" draggable onDragStart={(e) => handleDragStart(e, file.id)} onDragEnd={handleDragEnd}>
                                        <div
                                            className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 group-hover:border-indigo-400 transition-all shadow-sm group-hover:shadow-md cursor-pointer relative"
                                            onClick={(e) => {
                                                if (isDragging) return; // Prevent click during drag
                                                if (selectionMode) {
                                                    toggleSelection(e, file.id);
                                                } else {
                                                    setPreviewFile(file);
                                                }
                                            }}
                                        >

                                            {/* Selection Checkbox */}
                                            <div
                                                onClick={(e) => toggleSelection(e, file.id)}
                                                className={`absolute top-2 left-2 p-1 rounded-full cursor-pointer z-10 transition-all ${selectedItems.has(file.id) || selectionMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} ${selectedItems.has(file.id) ? 'bg-indigo-600' : 'bg-black/30 hover:bg-black/50'}`}
                                            >
                                                {selectedItems.has(file.id) ? <CheckCircle size={14} className="text-white" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-white" />}
                                            </div>


                                            {renderFileThumbnail(file, 'large')}

                                            {/* Trash Icon (Stop Propagation to prevent preview) */}
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                <div
                                                    className="p-1.5 bg-white/90 rounded-full text-slate-400 cursor-grab active:cursor-grabbing shadow-sm hover:bg-slate-50 transition-colors"
                                                    title="Zum Verschieben ziehen"
                                                >
                                                    <GripVertical size={16} />
                                                </div>
                                                <button
                                                    onClick={(e) => handleDelete(e, file.id)}
                                                    className="p-1.5 bg-white/90 rounded-full hover:text-red-500 shadow-sm hover:bg-red-50 transition-colors"
                                                    title="Löschen"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300 truncate px-1">{file.filename}</p>
                                        <p className="text-[10px] text-slate-400 px-1">{formatSize(file.size_bytes)}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {filteredFiles.map(file => (
                                    <div key={file.id} draggable onDragStart={(e) => handleDragStart(e, file.id)} onDragEnd={handleDragEnd} onClick={() => !isDragging && setPreviewFile(file)} className="flex items-center gap-4 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-indigo-300 transition-all cursor-pointer group">
                                        <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                                            {renderFileThumbnail(file, 'small')}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm text-slate-900 dark:text-white truncate">{file.filename}</div>
                                            <div className="text-xs text-slate-500">{formatSize(file.size_bytes)} • {new Date(file.created_at).toLocaleDateString()}</div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 px-2">
                                            <button
                                                onClick={(e) => handleDelete(e, file.id)}
                                                className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 px-2 cursor-grab active:cursor-grabbing text-slate-400" title="Zum Verschieben ziehen">
                                            <GripVertical size={16} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {filteredFiles.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <Folder size={64} className="mb-4 opacity-20" />
                                <p>Dieser Ordner ist leer.</p>
                                {selectedFolderId && (
                                    <p className="text-sm mt-2 text-slate-500">Lade Dateien hierher hoch oder verschiebe sie.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
