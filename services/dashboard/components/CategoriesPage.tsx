import React, { useState, useEffect } from 'react';
import {
    Tag, Folder, Hash, Search, Filter,
    MoreHorizontal, Plus, Download, RefreshCw,
    ShoppingBag, Globe, ShoppingCart
} from 'lucide-react';

// Mock Interfaces until DB is ready
interface Category {
    id: string;
    name: string;
    slug: string;
    type: 'category' | 'tag' | 'collection';
    count: number;
    source: 'woocommerce' | 'shopify' | 'manual' | 'amazon';
    parentId?: string;
}

import { categoryService } from '../services/categoryService';

// ...Interfaces...

export const CategoriesPage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'category' | 'tag'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const data = await categoryService.getAll();
                setCategories(data);
            } catch (e) {
                console.error("Failed to load categories", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'woocommerce': return <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg"><ShoppingBag size={14} /></div>;
            case 'shopify': return <div className="p-1.5 bg-green-100 text-green-600 rounded-lg"><ShoppingBag size={14} /></div>;
            case 'amazon': return <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg"><ShoppingCart size={14} /></div>;
            default: return <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg"><Globe size={14} /></div>;
        }
    };

    const filteredCategories = categories.filter(cat => {
        const matchesTab = activeTab === 'all' || cat.type === activeTab || (activeTab === 'category' && cat.type === 'collection');
        const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const handleCreateCategory = async () => {
        const name = prompt('Name der neuen Kategorie:');
        if (!name) return;

        try {
            // Simple slug generation
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

            await categoryService.create({
                name,
                slug,
                type: 'category',
                source: 'manual'
            });

            // Reload
            const data = await categoryService.getAll();
            setCategories(data);
        } catch (error) {
            console.error(error);
            alert('Fehler beim Erstellen');
        }
    };

    return (
        <div className="p-6 lg:p-10 w-full mx-auto space-y-8 animate-fade-in-up">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-serif-display text-slate-900 dark:text-white">Kategorien & Tags</h1>
                    <p className="text-slate-500 mt-2">Verwalte deine Produktstruktur zentral über alle Kanäle.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <Download size={18} />
                        <span className="font-medium">Importieren</span>
                    </button>
                    <button
                        onClick={handleCreateCategory}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                    >
                        <Plus size={18} />
                        <span className="font-medium">Erstellen</span>
                    </button>
                </div>
            </div>

            {/* Stats / Import Status Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-6 text-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10">
                        <ShoppingBag size={120} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 text-purple-100 font-medium text-sm">
                            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                            <span>Status: {loading ? 'Lädt...' : 'Aktuell'}</span>
                        </div>
                        <div className="text-3xl font-bold">{categories.length}</div>
                        <div className="text-purple-100">Kategorien synchronisiert</div>
                    </div>
                </div>
                {/* More stats could go here */}
            </div>

            {/* Main Content */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">


                {/* Toolbar */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">

                    {/* Tabs */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'all' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Alle
                        </button>
                        <button
                            onClick={() => setActiveTab('category')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'category' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Kategorien
                        </button>
                        <button
                            onClick={() => setActiveTab('tag')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'tag' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Tags
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Suchen..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <th className="px-8 py-4 px-6">Name</th>
                                <th className="px-6 py-4">Typ</th>
                                <th className="px-6 py-4">Quelle</th>
                                <th className="px-6 py-4">Produkte</th>
                                <th className="px-6 py-4 text-right">Aktionen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredCategories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <td className="px-8 py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                {cat.type === 'tag' ? <Hash size={18} /> : <Folder size={18} />}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900 dark:text-white">{cat.name}</div>
                                                <div className="text-xs text-slate-400">/{cat.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                            ${cat.type === 'tag' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                cat.type === 'collection' ? 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' :
                                                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                                            {cat.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {getSourceIcon(cat.source)}
                                            <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">{cat.source}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{cat.count}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredCategories.length === 0 && (
                    <div className="p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                            <Tag className="text-slate-400" size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">Keine Kategorien gefunden</h3>
                        <p className="text-slate-500 mt-1">Versuche andere Suchbegriffe oder importiere neue Daten.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
