import React, { useState } from 'react';
import {
    Image as ImageIcon, Film, File, Trash2, Upload, Grid, List,
    MoreVertical, Folder, Star, Clock, FolderPlus, Search,
    CheckCircle, AlertCircle
} from 'lucide-react';

// Mock Data
const MOCK_FILES = [
    { id: '1', name: 'Header-Summer.jpg', type: 'image', size: '1.2 MB', url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&q=80', active: true, folder: 'Campaigns' },
    { id: '2', name: 'Product-Shoe-Red.png', type: 'image', size: '450 KB', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80', active: true, folder: 'Products' },
    { id: '3', name: 'Promo-Video.mp4', type: 'video', size: '15.4 MB', url: '', active: true, folder: 'Videos' },
    { id: '4', name: 'Unused-Banner.png', type: 'image', size: '2.1 MB', url: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=400&q=80', active: false, folder: 'Inactive' },
    { id: '5', name: 'Logo-V2.svg', type: 'image', size: '4 KB', url: 'https://images.unsplash.com/photo-1629904853001-ad75929c1763?auto=format&fit=crop&w=400&q=80', active: true, folder: 'Assets' },
    { id: '6', name: 'Old-Campaign.jpg', type: 'image', size: '3.4 MB', url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80', active: false, folder: 'Inactive' },
];

const FOLDERS = ['All Media', 'Products', 'Campaigns', 'Assets', 'Videos'];

export const MediaLibrary: React.FC = () => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedFolder, setSelectedFolder] = useState('All Media');
    const [showInactive, setShowInactive] = useState(false);

    const filteredFiles = MOCK_FILES.filter(file => {
        if (showInactive) return !file.active; // Show only inactive
        if (selectedFolder === 'All Media') return file.active;
        return file.folder === selectedFolder && file.active;
    });

    return (
        <div className="p-6 lg:p-10 w-full mx-auto h-[calc(100vh-100px)] flex flex-col animate-fade-in-up">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-serif-display text-slate-900 dark:text-white">Medien</h1>
                    <p className="text-slate-500 mt-1">Verwalte Bilder, Videos und Dokumente.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-shadow shadow-lg shadow-indigo-200 dark:shadow-none font-medium">
                    <Upload size={18} />
                    <span>Hochladen</span>
                </button>
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

                    <div className="space-y-1 flex-1 overflow-y-auto custom-scrollbar-hide">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">Ordner</div>
                        {FOLDERS.map(folder => (
                            <button
                                key={folder}
                                onClick={() => { setSelectedFolder(folder); setShowInactive(false); }}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${selectedFolder === folder && !showInactive ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 font-medium' : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                                <Folder size={18} className={selectedFolder === folder && !showInactive ? 'fill-indigo-200 text-indigo-500' : 'text-slate-400'} />
                                {folder}
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
                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <Trash2 size={18} className="text-slate-400" />
                            Papierkorb
                        </button>
                    </div>

                    <button className="mt-4 flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
                        <FolderPlus size={18} />
                        Neuer Ordner
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col">

                    {/* Toolbar */}
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="font-medium text-slate-900 dark:text-white">
                                {showInactive ? 'Inaktive Dateien' : selectedFolder}
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
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                {filteredFiles.map(file => (
                                    <div key={file.id} className="group relative">
                                        <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 group-hover:border-indigo-400 transition-all shadow-sm group-hover:shadow-md cursor-pointer">
                                            {file.type === 'video' ? (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-900">
                                                    <Film size={32} className="text-white opacity-50" />
                                                </div>
                                            ) : (
                                                <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                                            )}

                                            {/* Overlay Actions */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
                                                {/* Actions like View/Delete */}
                                            </div>

                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1 bg-white/90 rounded-full hover:text-red-500 shadow-sm">
                                                    <MoreVertical size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300 truncate px-1">{file.name}</p>
                                        <p className="text-[10px] text-slate-400 px-1">{file.size}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {filteredFiles.map(file => (
                                    <div key={file.id} className="flex items-center gap-4 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-indigo-300 transition-all cursor-pointer group">
                                        <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                                            {file.type === 'image' && <img src={file.url} className="w-full h-full object-cover" />}
                                            {file.type === 'video' && <div className="w-full h-full flex items-center justify-center"><Film size={16} /></div>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm text-slate-900 dark:text-white truncate">{file.name}</div>
                                            <div className="text-xs text-slate-500">{file.size} • {new Date().toLocaleDateString()}</div>
                                        </div>
                                        <div className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-500">
                                            {file.folder}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {filteredFiles.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <Folder size={64} className="mb-4 opacity-20" />
                                <p>Dieser Ordner ist leer.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
