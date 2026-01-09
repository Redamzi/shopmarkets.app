import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Star, Heart, LayoutGrid, List as ListIcon, MoreHorizontal, Pencil, Copy, Trash2, Download, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { ProductGalleryModal } from './ProductGalleryModal';

interface ProductListProps {
    products: Product[];
    onAddProduct?: () => void;
    onEditProduct?: (product: Product) => void;
    onImport?: () => void;
    onIncrementStock?: (id: string) => void;
    onDeleteProduct?: (id: string) => void;
}

export const ProductList: React.FC<ProductListProps> = ({ products, onAddProduct, onEditProduct, onImport, onIncrementStock, onDeleteProduct }) => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const toggleMenu = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setActiveMenuId(activeMenuId === id ? null : id);
    };

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
    };

    const handleEdit = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        if (onEditProduct) {
            onEditProduct(product);
        }
        setActiveMenuId(null);
    };

    return (
        <div className="space-y-6 lg:space-y-8">
            {/* Product Gallery Modal */}
            <ProductGalleryModal
                isOpen={!!selectedProduct}
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
                onEdit={(product) => {
                    if (onEditProduct) onEditProduct(product);
                }}
            />

            {/* Toolbar */}
            <div className="flex flex-col gap-4">
                {/* Mobile: Top row actions */}
                <div className="flex items-center justify-between md:hidden">
                    <h2 className="text-lg font-bold font-serif-display">Artikel</h2>
                    <div className="flex items-center gap-2">
                        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                            >
                                <LayoutGrid size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                            >
                                <ListIcon size={16} />
                            </button>
                        </div>
                        {onImport && (
                            <button
                                onClick={onImport}
                                className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"
                            >
                                <Download size={18} />
                            </button>
                        )}
                        <button
                            onClick={onAddProduct}
                            className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 active:scale-90 transition-transform"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-row md:items-center justify-between gap-4 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    <div className="flex gap-2 lg:gap-4 min-w-max">
                        <button className="px-5 py-2 rounded-full bg-slate-900 text-white font-medium text-sm shadow-md flex items-center justify-center">Alle</button>
                        <button className="px-5 py-2 rounded-full border border-slate-200 bg-white text-slate-500 hover:text-slate-900 font-medium text-sm flex items-center justify-center">Stuhl</button>
                        <button className="px-5 py-2 rounded-full border border-slate-200 bg-white text-slate-500 hover:text-slate-900 font-medium text-sm flex items-center justify-center">Tisch</button>
                        <button className="px-5 py-2 rounded-full border border-slate-200 bg-white text-slate-500 hover:text-slate-900 font-medium text-sm flex items-center justify-center">Lampe</button>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* View Toggle */}
                        <div className="flex bg-slate-100 rounded-xl p-1 gap-1 mr-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                                title="Rasteransicht"
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                                title="Listenansicht"
                            >
                                <ListIcon size={18} />
                            </button>
                        </div>

                        {onImport && (
                            <button
                                onClick={onImport}
                                className="h-10 px-4 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 flex items-center gap-2 transition-colors"
                            >
                                <Download size={18} />
                                <span className="hidden lg:inline">Importieren</span>
                            </button>
                        )}

                        <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50">
                            <Filter size={18} />
                        </button>
                        <button
                            onClick={onAddProduct}
                            className="h-10 px-6 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-transform active:scale-95 gap-2 font-medium"
                        >
                            <Plus size={18} />
                            <span className="hidden lg:inline">Produkt</span>
                        </button>
                    </div>
                </div>
            </div>

            {viewMode === 'grid' ? (
                /* GRID VIEW - Neo-Modern Card Design */
                /* Modified for 2 columns on mobile (grid-cols-2) and adjusted gap */
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 pb-20">
                    {products.map((product, index) => {
                        const isNew = index < 2;
                        return (
                            <div
                                key={product.id}
                                onClick={() => handleProductClick(product)}
                                className="group relative bg-white dark:bg-slate-900 rounded-3xl md:rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-blue-100/50 dark:hover:shadow-indigo-900/20 transition-all duration-500 flex flex-col overflow-hidden h-full cursor-pointer"
                            >
                                {/* Image Container - Aspect 4:5 edge-to-edge */}
                                <div className="relative w-full aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-800">
                                    <img
                                        src={product.image_url}
                                        alt={product.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />

                                    {/* Badges - Glassmorphism */}
                                    <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10">
                                        <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white text-[10px] md:text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-sm border border-white/20">
                                            {product.category || 'Urban Time'}
                                        </span>
                                    </div>

                                    {/* Sale/Status Badge */}
                                    {(isNew || product.stock < 5) && (
                                        <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10">
                                            <span className="bg-black text-white text-[10px] md:text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-sm">
                                                {product.stock < 5 ? 'Low Stock' : 'Sale'}
                                            </span>
                                        </div>
                                    )}

                                    {/* Floating Action Button (Slide Up) - Hidden on Mobile touch, visible on hover */}
                                    <div className="absolute bottom-6 inset-x-0 flex justify-center z-10 translate-y-16 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out hidden md:flex">
                                        <button
                                            className="bg-white text-slate-900 px-6 py-2.5 rounded-full font-bold text-sm shadow-xl hover:bg-slate-50 transition-colors flex items-center gap-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleProductClick(product);
                                            }}
                                        >
                                            Produkt ansehen
                                        </button>
                                    </div>
                                </div>

                                {/* Content Area - Adjusted padding for mobile */}
                                <div className="p-3 md:p-5 flex flex-col flex-1 relative bg-white dark:bg-slate-900">
                                    <h3 className="font-bold text-slate-900 dark:text-white text-sm md:text-lg leading-tight mb-1 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {product.title}
                                    </h3>
                                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-2 md:mb-4 flex-1">
                                        {product.sku} - {product.description || "Elegantes, minimalistisches Design für moderne Ansprüche."}
                                    </p>

                                    <div className="flex items-end justify-between mt-auto pt-2">
                                        <div>
                                            <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Preis</p>
                                            <span className="font-display font-bold text-base md:text-xl text-slate-900 dark:text-white">
                                                ${product.price.toFixed(2)}
                                            </span>
                                        </div>

                                        {/* Action / Menu Button - CLEAN PENCIL NO FRAME */}
                                        <div className="relative">
                                            <button
                                                onClick={(e) => toggleMenu(e, product.id)}
                                                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all ${activeMenuId === product.id
                                                        ? 'bg-slate-900 text-white'
                                                        : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                                    }`}
                                            >
                                                <Pencil size={14} className="md:w-[18px] md:h-[18px]" strokeWidth={2} />
                                            </button>

                                            {/* Popover Menu */}
                                            {activeMenuId === product.id && (
                                                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 origin-bottom-right" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={(e) => handleEdit(e, product)}
                                                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200 font-medium transition-colors"
                                                    >
                                                        <Pencil size={16} className="text-slate-400" /> Bearbeiten
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onIncrementStock?.(product.id);
                                                            setActiveMenuId(null);
                                                        }}
                                                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200 font-medium transition-colors"
                                                    >
                                                        <Plus size={16} className="text-slate-400" /> Bestand +1
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveMenuId(null);
                                                        }}
                                                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200 font-medium transition-colors"
                                                    >
                                                        <Copy size={16} className="text-slate-400" /> Duplizieren
                                                    </button>
                                                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2" />
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDeleteProduct?.(product.id);
                                                            setActiveMenuId(null);
                                                        }}
                                                        className="w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 text-sm text-red-600 dark:text-red-400 font-medium transition-colors rounded-b-xl"
                                                    >
                                                        <Trash2 size={16} /> Löschen
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* LIST VIEW */
                <div className="space-y-3 pb-20">
                    {/* Header Row (Desktop only) */}
                    <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <div className="col-span-5">Produkt</div>
                        <div className="col-span-2">SKU</div>
                        <div className="col-span-2">Preis</div>
                        <div className="col-span-2">Bestand</div>
                        <div className="col-span-1 text-right">Aktionen</div>
                    </div>

                    {products.map((product) => (
                        <div
                            key={product.id}
                            onClick={() => handleProductClick(product)}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-3 lg:p-4 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col lg:grid lg:grid-cols-12 gap-4 items-center group relative overflow-visible cursor-pointer"
                        >

                            {/* Product Info */}
                            <div className="flex items-center gap-4 w-full lg:col-span-5">
                                <div className="w-16 h-16 lg:w-14 lg:h-14 rounded-xl bg-slate-50 dark:bg-slate-800 flex-shrink-0 overflow-hidden relative">
                                    <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm lg:text-base truncate">{product.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star key={s} size={10} fill={s <= 4 ? "#fbbf24" : "#e2e8f0"} className={s <= 4 ? "text-amber-400" : "text-slate-200 dark:text-slate-700"} />
                                            ))}
                                        </div>
                                        <span className="text-xs text-slate-400 font-mono hidden lg:inline">{product.id.slice(0, 8)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* SKU (Mobile hidden, Desktop visible) */}
                            <div className="hidden lg:block lg:col-span-2">
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-md text-xs font-mono font-medium">
                                    {product.sku}
                                </span>
                            </div>

                            {/* Price & Stock Row for Mobile / Columns for Desktop */}
                            <div className="flex items-center justify-between w-full lg:w-auto lg:contents">
                                <div className="lg:col-span-2">
                                    <span className="font-bold text-slate-900 dark:text-white">€{product.price.toFixed(2).replace('.', ',')}</span>
                                </div>

                                <div className="lg:col-span-2">
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${product.stock > 10 ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                                            product.stock > 0 ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' :
                                                'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                        }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 10 ? 'bg-green-500' :
                                                product.stock > 0 ? 'bg-orange-500' :
                                                    'bg-red-500'
                                            }`}></div>
                                        {product.stock} Stk.
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-2 w-full lg:w-auto lg:col-span-1 border-t dark:border-slate-800 lg:border-t-0 pt-3 lg:pt-0 border-slate-50 mt-1 lg:mt-0 relative">
                                <div className="relative">
                                    <button
                                        onClick={(e) => toggleMenu(e, product.id)}
                                        className={`w-8 h-8 rounded-full ${activeMenuId === product.id ? 'bg-slate-900 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'} flex items-center justify-center hover:bg-slate-900 hover:text-white transition-colors`}
                                        title="Bearbeiten"
                                    >
                                        <Pencil size={14} />
                                    </button>

                                    {/* List View Popover */}
                                    {activeMenuId === product.id && (
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 origin-top-right" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={(e) => handleEdit(e, product)}
                                                className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200 font-medium transition-colors"
                                            >
                                                <Pencil size={14} className="text-slate-400" /> Bearbeiten
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onIncrementStock?.(product.id);
                                                    setActiveMenuId(null);
                                                }}
                                                className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200 font-medium transition-colors"
                                            >
                                                <Plus size={14} className="text-slate-400" /> Bestand +1
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveMenuId(null);
                                                }}
                                                className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200 font-medium transition-colors"
                                            >
                                                <Copy size={14} className="text-slate-400" /> Duplizieren
                                            </button>
                                            <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2" />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteProduct?.(product.id);
                                                    setActiveMenuId(null);
                                                }}
                                                className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 text-sm text-red-600 dark:text-red-400 font-medium transition-colors rounded-b-lg"
                                            >
                                                <Trash2 size={14} /> Löschen
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};