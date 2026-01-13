import React, { useState, useEffect, useRef } from 'react';
import {
    Image as ImageIcon, Film, File, Trash2, Upload, Grid, List,
    MoreVertical, Folder, Star, Clock, FolderPlus, Search,
    CheckCircle, AlertCircle, RefreshCw, X, Download, ChevronLeft, ChevronRight, BookOpen, FileText, GripVertical,
    Square
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
    const [error, setError] = useState<string | null>(null);

    // Modals
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [selectionMode, setSelectionMode] = useState(isPicker); // Default to selection mode if picker

    // Drag state
    const [isDragging, setIsDragging] = useState(false);
    const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(undefined); // undefined = none, null = All Media
    const dragCounter = useRef(0);

    // File Input Ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Confirmation Dialog State
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        message: '',
        onConfirm: () => { }
    });

    const showConfirmDialog = (message: string, onConfirm: () => void) => {
        setConfirmDialog({ isOpen: true, message, onConfirm });
    };

    const handleConfirmDialogClose = (confirmed: boolean) => {
        if (confirmed) {
            confirmDialog.onConfirm();
        }
        setConfirmDialog({ isOpen: false, message: '', onConfirm: () => { } });
    };

    // Filter Files Logic
    const filteredFiles = files.filter(file => {
        if (showInactive) return !file.is_active;
        if (selectedFolderId === null) return file.is_active;
        return file.folder_id === selectedFolderId && file.is_active;
    });

    const toggleSelection = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newSelected = new Set(selectedItems);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedItems(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedItems.size === filteredFiles.length) {
            // Deselect all
            setSelectedItems(new Set());
        } else {
            // Select all visible
            const newSelected = new Set(filteredFiles.map(f => f.id));
            setSelectedItems(newSelected);
        }
    };

    const handleConfirmSelection = () => {
        if (onSelect) {
            const selectedFiles = files.filter(f => selectedItems.has(f.id));
            onSelect(selectedFiles);
        }
    };

    const handleBulkDelete = async () => {
        showConfirmDialog(
            `Möchten Sie ${selectedItems.size} Dateien wirklich löschen?`,
            async () => {
                try {
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
            }
        );
    };

    // Drag & Drop Handlers
    const handleDragStart = (e: React.DragEvent, fileId: string) => {
        // Only for internal moves
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('fileId', fileId);
        // We set isDragging true via dragEnter usually, but here manually is fine too, 
        // but let's rely on standard events if possible or distinct internal drag state.
        // Actually, for internal drag, we might want different visual.
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        setDragOverFolderId(undefined);
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current += 1;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current -= 1;
        if (dragCounter.current === 0) {
            setIsDragging(false);
            setDragOverFolderId(undefined);
        }
    };

    // handleDragOver remains for folder highlighting logic
    const handleDragOver = (e: React.DragEvent, folderId: string | null) => {
        e.preventDefault();
        e.stopPropagation();
        // Needed to allow drop
        e.dataTransfer.dropEffect = 'copy'; // Default to copy for external
        if (e.dataTransfer.types.includes('fileId')) {
            e.dataTransfer.dropEffect = 'move'; // Move for internal
        }

        if (dragOverFolderId !== folderId) {
            setDragOverFolderId(folderId);
        }
    };

    const handleDrop = async (e: React.DragEvent, targetFolderId: string | null) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverFolderId(undefined);
        setIsDragging(false);
        dragCounter.current = 0;

        // 1. External Files (Upload)
        // Check if files attribute exists (standard way)
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const fileList = e.dataTransfer.files;
            setUploading(true);
            try {
                const formData = new FormData();
                for (let i = 0; i < fileList.length; i++) {
                    formData.append('files', fileList[i]);
                }

                const uploadDest = targetFolderId !== undefined && targetFolderId !== null ? targetFolderId : selectedFolderId;

                if (uploadDest) {
                    formData.append('folderId', uploadDest);
                }

                await mediaService.upload(formData);
                await loadData();
            } catch (error: any) {
                console.error('Drop Upload failed:', error);
                alert('Upload fehlgeschlagen.');
            } finally {
                setUploading(false);
            }
            return;
        }

        // 2. Internal Files (Move)
        const fileId = e.dataTransfer.getData('fileId');
        if (!fileId) return;

        const filesToMove: string[] = [];
        if (selectedItems.has(fileId)) {
            selectedItems.forEach(id => filesToMove.push(id));
        } else {
            filesToMove.push(fileId);
        }

        console.log(`📦 Moving ${filesToMove.length} files to folder:`, targetFolderId);

        try {
            setLoading(true);
            const movePromises = filesToMove.map(id => {
                const file = files.find(f => f.id === id);
                if (file && file.folder_id === targetFolderId) return Promise.resolve();
                return mediaService.moveFile(id, targetFolderId);
            });

            await Promise.all(movePromises);

            if (selectedItems.has(fileId)) {
                setSelectedItems(new Set());
                if (!isPicker) setSelectionMode(false);
            }
            await loadData();
        } catch (error: any) {
            console.error('Move failed:', error);
            alert(`Fehler beim Verschieben: ${error?.response?.data?.error || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const loadData = async () => {
        setError(null);
        try {
            setLoading(true);
            const [filesData, foldersData] = await Promise.all([
                mediaService.getAll(),
                mediaService.getFolders()
            ]);
            setFiles(filesData);
            setFolders(foldersData);
        } catch (e: any) {
            console.error("Failed to load media data", e);
            if (e.response && (e.response.status === 401 || e.response.status === 403)) {
                setError("Zugriff verweigert (403). Bitte prüfen Sie die Authentifizierung oder laden Sie die Seite neu.");
            } else {
                setError("Fehler beim Laden der Mediathek. Bitte API prüfen.");
            }
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
        const fileList = event.target.files;
        if (!fileList || fileList.length === 0) return;

        setUploading(true);
        try {
            const formData = new FormData();
            // Append all files with key 'files' (matching backend multer.array('files'))
            for (let i = 0; i < fileList.length; i++) {
                formData.append('files', fileList[i]);
            }

            if (selectedFolderId) {
                formData.append('folderId', selectedFolderId);
            }

            await mediaService.upload(formData);
            await loadData();
        } catch (error: any) {
            console.error('Upload failed:', error);
            const msg = error?.response?.data?.error || error?.message || 'Unbekannter Fehler';
            alert(`Upload fehlgeschlagen: ${msg} (Status: ${error?.response?.status})`);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (e: React.MouseEvent | null, id: string) => {
        if (e) e.stopPropagation();
        showConfirmDialog(
            'Möchten Sie diese Datei wirklich löschen?',
            async () => {
                try {
                    await mediaService.delete(id);
                    if (previewFile && previewFile.id === id) setPreviewFile(null);
                    await loadData();
                } catch (error) {
                    console.error('Delete failed:', error);
                    alert('Löschen fehlgeschlagen.');
                }
            }
        );
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
        showConfirmDialog(
            'Ordner wirklich löschen? Inhalte werden NICHT gelöscht, sondern in "Alle Medien" verschoben.',
            async () => {
                try {
                    await mediaService.deleteFolder(folderId);
                    if (selectedFolderId === folderId) setSelectedFolderId(null);
                    await loadData();
                } catch (error) {
                    console.error('Delete folder failed:', error);
                    alert('Ordner konnte nicht gelöscht werden.');
                }
            }
        );
    };

    // Helper to format bytes
    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileType = (file: MediaFile) => {
        if (file.type) return file.type;
        const ext = file.filename.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') return 'application/pdf';
        if (ext === 'epub') return 'application/epub+zip';
        if (['mp4', 'webm', 'mov'].includes(ext || '')) return 'video/mp4';
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return 'image/jpeg';
        return 'unknown';
    };

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

    return (
        <div className={`w-full mx-auto flex flex-col relative ${isPicker ? 'h-full' : 'p-6 lg:p-10 h-[calc(100vh-100px)]'}`}
            onDragOver={(e) => handleDragOver(e, null)}
            onDrop={(e) => handleDrop(e, selectedFolderId)}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
        >
            <input
                type="file"
                multiple
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept="image/*,video/*,application/pdf,application/epub+zip"
            />

            {/* Error Banner */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center justify-between text-red-600 dark:text-red-400">
                    <div className="flex items-center gap-3">
                        <AlertCircle size={24} />
                        <span className="font-medium">{error}</span>
                    </div>
                    <button
                        onClick={loadData}
                        className="px-4 py-2 bg-white dark:bg-red-950/30 rounded-lg text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors"
                    >
                        Erneut versuchen
                    </button>
                </div>
            )}

            {/* Picker Header */}
            {isPicker && (
                <div className="flex justify-between items-center mb-4 px-1 shrink-0">
                    <h2 className="text-xl font-bold dark:text-white">Medien auswählen</h2>
                    <div className="flex gap-2">
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

            {/* Normal Header */}
            {!isPicker && (
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <div>
                        <h1 className="text-3xl font-bold font-serif-display text-slate-900 dark:text-white">Medien <span className="text-xs text-slate-300 font-sans font-normal opacity-50">v.m 2.1</span></h1>
                        <p className="text-slate-500 mt-1">Verwalte Bilder, Videos und Dokumente.</p>
                    </div>
                    <div className="flex gap-2">
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
            <div className={`flex-1 overflow-hidden flex ${isPicker ? 'bg-white dark:bg-slate-900 rounded-2xl' : 'bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm'}`}>

                {/* Sidebar */}
                <div className="w-64 bg-slate-50/50 dark:bg-slate-800/30 border-r border-slate-100 dark:border-slate-800 p-6 flex flex-col">
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

                        {/* All Media */}
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

                        {/* Folder List */}
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
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col">
                    {/* Toolbar */}
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
                        <div className="flex items-center gap-4">
                            {/* Checkbox Select All */}
                            <button
                                onClick={handleSelectAll}
                                className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                {selectedItems.size === filteredFiles.length && filteredFiles.length > 0 ? (
                                    <CheckCircle size={20} className="text-indigo-600" />
                                ) : (
                                    <Square size={20} />
                                )}
                                <span>Alle auswählen</span>
                            </button>

                            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

                            <div className="text-sm text-slate-500">
                                {selectedItems.size > 0 ? (
                                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                        {selectedItems.size} markiert
                                    </span>
                                ) : (
                                    <>
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            {showInactive ? 'Inaktive Dateien' : currentFolderName}
                                        </span>
                                        <span className="mx-2">•</span>
                                        <span>{filteredFiles.length} Elemente</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {selectedItems.size > 0 && (
                                <button
                                    onClick={handleBulkDelete}
                                    className="text-red-500 hover:text-red-700 flex items-center gap-1.5 px-3 py-1 bg-red-50 dark:bg-red-900/20 rounded-md transition-colors mr-2"
                                >
                                    <Trash2 size={16} /> Löschen
                                </button>
                            )}

                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                >
                                    <Grid size={18} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                >
                                    <List size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* DROPZONE & Grid */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative">
                        {/* Drag Overlay Hint */}
                        {isDragging && (
                            <div className="absolute inset-0 z-50 bg-indigo-50/90 dark:bg-slate-900/90 border-4 border-dashed border-indigo-500 m-4 rounded-2xl flex flex-col items-center justify-center animate-pulse pointer-events-none">
                                <Upload size={64} className="text-indigo-600 dark:text-indigo-400 mb-4" />
                                <h3 className="text-2xl font-bold text-indigo-900 dark:text-white">Dateien hier ablegen</h3>
                            </div>
                        )}

                        {/* Explicit Dropzone visible when not dragging too, for user convenience */}
                        <div
                            onClick={handleUploadClick}
                            className="mb-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-indigo-300 transition-all cursor-pointer group"
                        >
                            <Upload size={32} className="mb-2 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                            <p className="font-medium text-slate-600 dark:text-slate-300 text-sm">Upload per Klick oder Drag & Drop</p>
                        </div>

                        {loading && (
                            <div className="flex items-center justify-center h-40">
                                <RefreshCw className="animate-spin text-indigo-600" size={32} />
                            </div>
                        )}

                        {!loading && filteredFiles.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                                <p className="text-lg font-medium">Dieser Ordner ist noch leer</p>
                            </div>
                        )}

                        {!loading && filteredFiles.length > 0 && (
                            viewMode === 'grid' ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {filteredFiles.map(file => (
                                        <div
                                            key={file.id}
                                            onClick={(e) => {
                                                if (selectionMode || isPicker) { // Always allow selection logic
                                                    toggleSelection(e, file.id);
                                                } else {
                                                    setPreviewFile(file);
                                                }
                                            }}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, file.id)}
                                            onDragEnd={handleDragEnd}
                                            className={`group relative aspect-square bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${selectedItems.has(file.id)
                                                ? 'border-indigo-500 ring-2 ring-indigo-500/20 z-10'
                                                : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                                                }`}
                                        >
                                            {renderFileThumbnail(file)}

                                            {/* Selection Overlay */}
                                            <div className={`absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-2 ${selectedItems.has(file.id) ? 'opacity-100 bg-indigo-900/10' : ''}`}>
                                                <button
                                                    onClick={(e) => toggleSelection(e, file.id)}
                                                    className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${selectedItems.has(file.id)
                                                        ? 'bg-indigo-600 text-white shadow-sm'
                                                        : 'bg-white/80 dark:bg-black/50 text-slate-500 hover:bg-white'
                                                        }`}
                                                >
                                                    {selectedItems.has(file.id) && <CheckCircle size={14} />}
                                                </button>
                                            </div>

                                            {/* Footer Gradient */}
                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-white text-xs truncate font-medium">{file.filename}</p>
                                                <p className="text-white/70 text-[10px]">{formatSize(file.size_bytes)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {filteredFiles.map(file => (
                                        <div
                                            key={file.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, file.id)}
                                            onDragEnd={handleDragEnd}
                                            onClick={(e) => toggleSelection(e, file.id)}
                                            className={`flex items-center gap-4 p-3 rounded-lg border transition-all cursor-pointer ${selectedItems.has(file.id)
                                                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
                                                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-indigo-300'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedItems.has(file.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'}`}>
                                                {selectedItems.has(file.id) && <CheckCircle size={12} />}
                                            </div>

                                            <div className="w-10 h-10 shrink-0">
                                                {renderFileThumbnail(file, 'small')}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{file.filename}</p>
                                                <p className="text-xs text-slate-500">{formatSize(file.size_bytes)} • {new Date(file.created_at).toLocaleDateString()}</p>
                                            </div>

                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={(e) => { e.stopPropagation(); setPreviewFile(file); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-indigo-500">
                                                    <Grid size={16} />
                                                </button>
                                                <button onClick={(e) => handleDelete(e, file.id)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-red-500">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {previewFile && (
                <div className="fixed inset-0 z-50 bg-white/95 dark:bg-slate-900/95 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" onClick={() => setPreviewFile(null)}>

                    {/* Navigation Buttons for Preview */}
                    {filteredFiles.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const currentIndex = filteredFiles.findIndex(f => f.id === previewFile.id);
                                    const nextIndex = (currentIndex - 1 + filteredFiles.length) % filteredFiles.length;
                                    setPreviewFile(filteredFiles[nextIndex]);
                                }}
                                className="absolute left-4 md:left-10 p-3 bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 z-50"
                            >
                                <ChevronLeft size={28} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const currentIndex = filteredFiles.findIndex(f => f.id === previewFile.id);
                                    const nextIndex = (currentIndex + 1) % filteredFiles.length;
                                    setPreviewFile(filteredFiles[nextIndex]);
                                }}
                                className="absolute right-4 md:right-10 p-3 bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 z-50"
                            >
                                <ChevronRight size={28} />
                            </button>
                        </>
                    )}

                    <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setPreviewFile(null)}
                            className="absolute -top-12 right-0 md:top-0 md:-right-16 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors bg-white/50 dark:bg-black/50 p-2 rounded-full"
                        >
                            <X size={24} />
                        </button>

                        {/* Rendering Preview Content based on Type */}
                        {(() => {
                            const type = getFileType(previewFile);
                            if (type.startsWith('image')) {
                                return <img src={previewFile.url} className="max-w-full max-h-[80vh] rounded-lg shadow-2xl" />;
                            }
                            if (type.startsWith('video')) {
                                return <video src={previewFile.url} controls className="max-w-full max-h-[80vh] rounded-lg shadow-2xl" />;
                            }
                            // Default / PDF / EPUB View
                            return (
                                <div className="bg-slate-100 dark:bg-slate-800 p-20 rounded-2xl text-slate-500 flex flex-col items-center gap-6 border shadow-xl">
                                    <FileText size={64} className="text-indigo-500" />
                                    <div className="text-center">
                                        <p className="text-xl font-bold text-slate-700 dark:text-white mb-2">{previewFile.filename}</p>
                                        <p className="text-sm">{type}</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <a href={previewFile.url} download target="_blank" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                                            <Download size={18} /> Download
                                        </a>
                                        <button onClick={(e) => handleDelete(e, previewFile.id)} className="px-6 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 flex items-center gap-2">
                                            <Trash2 size={18} /> Löschen
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Only show these buttons if it's an image/video already rendered, to avoid double buttons */}
                        {(getFileType(previewFile).startsWith('image') || getFileType(previewFile).startsWith('video')) && (
                            <div className="mt-6 flex gap-4">
                                <a href={previewFile.url} download target="_blank" className="px-6 py-2 bg-white text-slate-900 rounded-lg hover:bg-slate-100 flex items-center gap-2 shadow-lg font-medium">
                                    <Download size={18} /> Download
                                </a>
                                <button onClick={(e) => handleDelete(e, previewFile.id)} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 shadow-lg font-medium">
                                    <Trash2 size={18} /> Löschen
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Create Folder Modal */}
            {isCreateFolderOpen && (
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
            )}

            {/* Confirmation Dialog */}
            {confirmDialog.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-scale-in">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Bestätigung</h3>
                        <p className="text-slate-600 dark:text-slate-300 mb-6">{confirmDialog.message}</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => handleConfirmDialogClose(false)}
                                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium"
                            >
                                Abbrechen
                            </button>
                            <button
                                onClick={() => handleConfirmDialogClose(true)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                Löschen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
