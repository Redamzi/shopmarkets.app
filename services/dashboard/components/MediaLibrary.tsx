import React, { useState, useEffect } from 'react';
import {
    Image as ImageIcon, Film, File, Trash2, Upload, Grid, List,
    MoreVertical, Folder, Star, Clock, FolderPlus, Search,
    CheckCircle, AlertCircle, RefreshCw, X, Download
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

export const MediaLibrary: React.FC = () => {
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

    // File Input Ref
    const fileInputRef = React.useRef<HTMLInputElement>(null);

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

    const currentFolderName = selectedFolderId
        ? folders.find(f => f.id === selectedFolderId)?.name || 'Unbekannter Ordner'
        : 'Alle Medien';

    return (
        <div className="p-6 lg:p-10 w-full mx-auto h-[calc(100vh-100px)] flex flex-col animate-fade-in-up relative">

            {/* Preview Modal */}
            {previewFile && (
                <div className="fixed inset-0 z-50 bg-white/95 dark:bg-slate-900/95 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" onClick={() => setPreviewFile(null)}>
                    <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setPreviewFile(null)}
                            className="absolute -top-12 right-0 md:top-0 md:-right-12 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors flex items-center gap-2 bg-white/50 dark:bg-black/50 p-2 rounded-full backdrop-blur-sm"
                        >
                            <X size={24} /> <span className="md:hidden">Schließen</span>
                        </button>

                        {(!previewFile.type || previewFile.type.startsWith('image')) ? (
                            <img src={previewFile.url} className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800" />
                        ) : (
                            <div className="bg-slate-100 dark:bg-slate-800 p-20 rounded-2xl text-slate-500 dark:text-slate-400 flex flex-col items-center gap-4 border border-slate-200 dark:border-slate-700">
                                <File size={48} />
                                <p>Vorschau für diesen Dateityp nicht verfügbar</p>
                            </div>
                        )}

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

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-serif-display text-slate-900 dark:text-white">Medien</h1>
                    <p className="text-slate-500 mt-1">Verwalte Bilder, Videos und Dokumente.</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                        accept="image/*,video/*,application/pdf"
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
                        className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-medium hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm"
                    >
                        <FolderPlus size={18} />
                        <span>Neuer Ordner</span>
                    </button>

                    <div className="space-y-1 flex-1 overflow-y-auto custom-scrollbar-hide">
                        <div className="flex items-center justify-between mb-2 px-3">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ordner</div>
                            <button
                                onClick={() => setIsCreateFolderOpen(true)}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-indigo-600 transition-colors"
                                title="Neuer Ordner"
                            >
                                <FolderPlus size={16} />
                            </button>
                        </div>

                        {/* All Media Button */}
                        <button
                            onClick={() => { setSelectedFolderId(null); setShowInactive(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${selectedFolderId === null && !showInactive ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 font-medium' : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        >
                            <Folder size={18} className={selectedFolderId === null && !showInactive ? 'fill-indigo-200 text-indigo-500' : 'text-slate-400'} />
                            Alle Medien
                        </button>

                        {/* Dynamic Folders */}
                        {folders.map(folder => (
                            <button
                                key={folder.id}
                                onClick={() => { setSelectedFolderId(folder.id); setShowInactive(false); }}
                                className={`group w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${selectedFolderId === folder.id && !showInactive ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 font-medium' : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <Folder size={18} className={selectedFolderId === folder.id && !showInactive ? 'fill-indigo-200 text-indigo-500' : 'text-slate-400'} />
                                    <span className="truncate">{folder.name}</span>
                                </div>
                                <div
                                    onClick={(e) => handleDeleteFolder(folder.id, e)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
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
                            <span className="font-medium text-slate-900 dark:text-white">
                                {showInactive ? 'Inaktive Dateien' : currentFolderName}
                            </span>
                            <span>•</span>
                            <span>{filteredFiles.length} Elemente</span>
                        </div>
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

                    {/* Files Grid/List */}
                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/50">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                {filteredFiles.map(file => (
                                    <div key={file.id} className="group relative" onClick={() => setPreviewFile(file)}>
                                        <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 group-hover:border-indigo-400 transition-all shadow-sm group-hover:shadow-md cursor-pointer relative">
                                            {(file.type || '').startsWith('video') ? (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-900">
                                                    <Film size={32} className="text-white opacity-50" />
                                                </div>
                                            ) : (
                                                <img src={file.url} alt={file.filename} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                            )}

                                            {/* Trash Icon (Stop Propagation to prevent preview) */}
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                    <div key={file.id} onClick={() => setPreviewFile(file)} className="flex items-center gap-4 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-indigo-300 transition-all cursor-pointer group">
                                        <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                                            {(file.type || '').startsWith('image') ? <img src={file.url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Film size={16} /></div>}
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
