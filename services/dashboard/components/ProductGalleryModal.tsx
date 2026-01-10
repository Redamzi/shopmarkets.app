import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { X, Edit, ChevronLeft, ChevronRight, Globe, BarChart3, TrendingUp, AlertCircle, CheckCircle2, Box, Tag, Layers, ExternalLink, Activity, ShoppingCart, Search, TrendingDown, ArrowUpRight, ArrowDownRight, DollarSign, Clock, Zap, Wallet } from 'lucide-react';
import { Product, Platform } from '../types';
import { AddChannelModal } from './AddChannelModal';

interface ProductGalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    onEdit?: (product: Product) => void;
}

export const ProductGalleryModal: React.FC<ProductGalleryModalProps> = ({ isOpen, onClose, product, onEdit }) => {
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isZoomOpen, setIsZoomOpen] = useState(false);
    const [statsTab, setStatsTab] = useState<'performance' | 'channels'>('performance');

    // Scroll container ref for mobile slider
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // State for Add Channel Modal
    const [isAddChannelOpen, setIsAddChannelOpen] = useState(false);
    const [currentChannels, setCurrentChannels] = useState<Platform[]>([]);

    // Update local channels when product changes
    useEffect(() => {
        if (product) {
            setCurrentChannels(product.channels);
        }
    }, [product]);

    if (!isOpen || !product) return null;

    // Gallery images - only show product image if available
    const galleryImages = product.image_url ? [product.image_url] : [];

    // Mock Sales Data for Chart
    const salesData = [
        { name: 'W1', value: 12 },
        { name: 'W2', value: 19 },
        { name: 'W3', value: 15 },
        { name: 'W4', value: 25 },
        { name: 'W5', value: 32 },
        { name: 'W6', value: 28 },
        { name: 'Today', value: 35 },
    ];

    // Mock Timeline Data
    const timeline = [
        { id: 1, type: 'sale', text: 'Verkauf via Shopify', time: 'vor 2 Std', icon: ShoppingBagIcon },
        { id: 2, type: 'sync', text: 'Bestand synchronisiert (Amazon)', time: 'vor 4 Std', icon: RefreshIcon },
        { id: 3, type: 'price', text: 'Preis angepasst durch Repricer', time: 'Gestern', icon: TagIcon },
    ];

    const handleEdit = () => {
        if (onEdit) {
            onEdit(product);
            onClose();
        }
    };

    const handleAddChannel = (connection: any) => {
        // In a real app, this would make an API call to link the product
        const newPlatform = connection.platform as Platform;
        if (!currentChannels.includes(newPlatform)) {
            setCurrentChannels([...currentChannels, newPlatform]);
        }
        setIsAddChannelOpen(false);
    };

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, clientWidth } = scrollContainerRef.current;
            const newIndex = Math.round(scrollLeft / clientWidth);
            if (newIndex !== activeImageIndex) {
                setActiveImageIndex(newIndex);
            }
        }
    };

    // Channel helper
    const getChannelInfo = (channel: Platform) => {
        switch (channel) {
            case 'shopify': return { label: 'Shopify', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
            case 'amazon': return { label: 'Amazon', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' };
            case 'woocommerce': return { label: 'WooCommerce', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' };
            case 'tiktok': return { label: 'TikTok', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' };
            case 'ebay': return { label: 'eBay', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
            default: return { label: channel, color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
        }
    };

    // Live Check Mock Data based on product price
    const competitor1 = (product.price * 1.15).toFixed(2); // Teurer
    const competitor2 = (product.price * 0.98).toFixed(2); // Günstiger (Gefahr)
    const competitor3 = (product.price * 1.05).toFixed(2); // Etwas teurer

    // Calc Profit
    const cost = product.price * 0.4; // 40% cost
    const profit = product.price - cost;
    const margin = ((profit / product.price) * 100).toFixed(0);

    // --- ZOOM LIGHTBOX OVERLAY ---
    if (isZoomOpen) {
        return (
            <div className="fixed inset-0 z-[120] bg-white dark:bg-slate-950 flex flex-col animate-in fade-in duration-300">
                <button
                    onClick={() => setIsZoomOpen(false)}
                    className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-white dark:bg-slate-900 shadow-xl flex items-center justify-center text-slate-900 dark:text-white hover:scale-110 transition-transform"
                >
                    <X size={24} />
                </button>

                <div className="flex-1 relative flex items-center justify-center p-4 md:p-10">
                    <img
                        src={galleryImages[activeImageIndex]}
                        alt="Zoom Ansicht"
                        className="max-w-full max-h-full object-contain shadow-2xl"
                    />

                    {/* Navigation Arrows */}
                    <button
                        onClick={(e) => { e.stopPropagation(); setActiveImageIndex(prev => prev === 0 ? galleryImages.length - 1 : prev - 1); }}
                        className="absolute left-4 md:left-10 w-14 h-14 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-xl flex items-center justify-center text-slate-900 dark:text-white hover:bg-white transition-colors"
                    >
                        <ChevronLeft size={28} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setActiveImageIndex(prev => prev === galleryImages.length - 1 ? 0 : prev + 1); }}
                        className="absolute right-4 md:right-10 w-14 h-14 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-xl flex items-center justify-center text-slate-900 dark:text-white hover:bg-white transition-colors"
                    >
                        <ChevronRight size={28} />
                    </button>
                </div>

                {/* Thumbnails Strip */}
                <div className="h-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-4 px-4 overflow-x-auto custom-scrollbar-hide shrink-0">
                    {galleryImages.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveImageIndex(idx)}
                            className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${activeImageIndex === idx ? 'border-slate-900 dark:border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // --- MAIN SPLIT SCREEN LAYOUT ---
    return (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 overflow-y-auto custom-scrollbar-hide animate-in slide-in-from-bottom-8 duration-500">

            {/* Add Channel Modal Integration */}
            <AddChannelModal
                isOpen={isAddChannelOpen}
                onClose={() => setIsAddChannelOpen(false)}
                onConnect={handleAddChannel}
            />

            {/* Navigation / Header (Absolute) */}
            <div className="absolute top-0 left-0 w-full p-6 lg:px-12 lg:py-8 flex justify-between items-start z-[60] pointer-events-none">
                <button
                    onClick={onClose}
                    className="pointer-events-auto w-12 h-12 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-900 dark:text-white hover:bg-white dark:hover:bg-slate-800 shadow-sm transition-all hover:scale-105"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="flex gap-3 pointer-events-auto">
                    <button onClick={handleEdit} className="w-auto px-6 h-12 rounded-full bg-slate-900 dark:bg-indigo-600 flex items-center justify-center text-white shadow-lg hover:bg-slate-800 transition-colors gap-2 font-medium">
                        <Edit size={18} />
                        <span className="hidden sm:inline">Bearbeiten</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row min-h-screen">

                {/* LEFT: Immersive Gallery (62%) - Mobile Slider / Desktop Masonry Grid */}
                {/* STICKY on mobile to allow content to scroll over it */}
                <div className="w-full lg:w-[62%] bg-slate-50 dark:bg-[#0b0f19] pt-0 lg:pl-12 lg:pr-6 pb-0 lg:pb-12 overflow-hidden md:overflow-visible relative sticky top-0 lg:static z-0">

                    {/* Scroll Container */}
                    <div
                        ref={scrollContainerRef}
                        onScroll={handleScroll}
                        className="flex md:grid md:grid-cols-2 gap-0 md:gap-4 lg:gap-6 mt-0 lg:mt-24 overflow-x-auto md:overflow-visible snap-x snap-mandatory scrollbar-hide pb-0 md:pb-0"
                    >
                        {galleryImages.map((img, idx) => (
                            <div
                                key={idx}
                                onClick={() => { setActiveImageIndex(idx); setIsZoomOpen(true); }}
                                className={`relative group cursor-zoom-in overflow-hidden md:rounded-2xl shrink-0 snap-center w-full md:w-auto aspect-[4/5] md:aspect-auto ${idx === 0 ? 'md:col-span-2 md:aspect-[4/3]' : 'md:aspect-[3/4]'}`}
                            >
                                <img
                                    src={img}
                                    alt={`Gallery ${idx}`}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                            </div>
                        ))}
                    </div>

                    {/* Mobile Dots Indicator */}
                    <div className="flex md:hidden justify-center gap-2 absolute bottom-24 lg:bottom-4 left-0 right-0 z-20 pointer-events-none">
                        {galleryImages.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1.5 rounded-full transition-all shadow-sm ${idx === activeImageIndex ? 'bg-white w-6' : 'bg-white/50 w-1.5 backdrop-blur-md'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* RIGHT: Sidebar (38%) - VENDOR DASHBOARD */}
                {/* Elevated z-index and negative margin on mobile to create sheet effect over sticky image */}
                <div className="w-full lg:w-[38%] bg-white dark:bg-slate-950 relative z-10 -mt-[60px] lg:mt-0 rounded-t-[2.5rem] lg:rounded-none shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:shadow-none">
                    <div className="lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto custom-scrollbar-hide px-6 lg:px-12 py-10 lg:py-24 flex flex-col">

                        {/* Header */}
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                            <span>{product.category || 'Produkt'}</span>
                            <ChevronRight size={10} />
                            <span className="text-slate-900 dark:text-white">Status: Aktiv</span>
                        </div>

                        <h1 className="text-2xl lg:text-3xl font-extrabold font-display text-slate-900 dark:text-white mb-2">
                            {product.title}
                        </h1>
                        <div className="flex items-center gap-3 text-sm text-slate-500 font-mono mb-8">
                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-700 dark:text-slate-300">SKU: {product.sku}</span>
                            <span>•</span>
                            <span>ID: {product.id}</span>
                        </div>

                        {/* KPI Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Verkaufspreis</p>
                                <span className="text-xl font-bold text-slate-900 dark:text-white font-tech">€{product.price.toFixed(2)}</span>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Lagerbestand</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-bold text-slate-900 dark:text-white font-tech">{product.stock}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${product.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {product.stock > 10 ? 'Gut' : 'Niedrig'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* COMBINED Performance & Channels Toggle */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
                                    <button
                                        onClick={() => setStatsTab('performance')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${statsTab === 'performance' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                    >
                                        <BarChart3 size={14} /> Performance
                                    </button>
                                    <button
                                        onClick={() => setStatsTab('channels')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${statsTab === 'channels' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                    >
                                        <Globe size={14} /> Kanäle
                                    </button>
                                </div>

                                {statsTab === 'channels' && (
                                    <button
                                        onClick={() => setIsAddChannelOpen(true)}
                                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                    >
                                        <Globe size={10} />
                                        + Kanal
                                    </button>
                                )}
                            </div>

                            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm min-h-[14rem] relative overflow-hidden">
                                {statsTab === 'performance' ? (
                                    <div className="h-48 w-full animate-in fade-in">
                                        <div className="absolute top-4 right-4 z-10">
                                            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                                                <TrendingUp size={12} /> +12%
                                            </span>
                                        </div>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={salesData}>
                                                <defs>
                                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#1e1b4b', borderRadius: '12px', border: 'none', color: 'white', fontSize: '12px' }}
                                                    itemStyle={{ color: '#a5b4fc' }}
                                                    cursor={{ stroke: '#6366f1', strokeWidth: 1 }}
                                                />
                                                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col animate-in fade-in">
                                        {currentChannels.length > 0 ? (
                                            <div className="flex flex-wrap gap-2 mb-auto content-start">
                                                {currentChannels.map(c => {
                                                    const info = getChannelInfo(c);
                                                    return (
                                                        <div key={c} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${info.color}`}>
                                                            <CheckCircle2 size={14} />
                                                            {info.label}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-slate-500 italic flex flex-col items-center justify-center h-48 gap-3">
                                                <AlertCircle size={24} className="text-slate-300" />
                                                Keine Kanäle verbunden
                                                <button
                                                    onClick={() => setIsAddChannelOpen(true)}
                                                    className="mt-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold shadow-lg"
                                                >
                                                    Jetzt verbinden
                                                </button>
                                            </div>
                                        )}
                                        {currentChannels.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 flex justify-between">
                                                <span>Letzter Sync: {new Date(product.lastSync).toLocaleDateString()}</span>
                                                <button className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Protokolle</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Profitability Card (New) */}
                        <div className="mb-8">
                            <div className="bg-slate-900 dark:bg-indigo-950 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
                                <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

                                <h4 className="font-bold text-sm uppercase tracking-wide opacity-70 mb-4 flex items-center gap-2">
                                    <Wallet size={16} /> Profitabilität
                                </h4>

                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <span className="text-3xl font-tech font-bold">€{profit.toFixed(2)}</span>
                                        <span className="text-xs text-indigo-200 block">Gewinn pro Einheit</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xl font-bold text-green-400">{margin}%</span>
                                        <span className="text-xs text-indigo-200 block">Marge</span>
                                    </div>
                                </div>

                                {/* Progress Bar Visual */}
                                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden flex mt-4">
                                    <div className="bg-red-400 h-full" style={{ width: '40%' }} title="Kosten (40%)"></div>
                                    <div className="bg-green-400 h-full" style={{ width: '60%' }} title="Gewinn (60%)"></div>
                                </div>
                                <div className="flex justify-between text-[10px] mt-2 opacity-60 font-medium uppercase tracking-wider">
                                    <span>Kosten: €{cost.toFixed(2)}</span>
                                    <span>Netto Gewinn</span>
                                </div>
                            </div>
                        </div>

                        {/* 3 Live Sources Price Radar */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                    <Activity size={16} /> Live Preis-Radar
                                </h4>
                                <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    Live
                                </span>
                            </div>

                            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-2 shadow-sm">

                                {/* Source 1: Amazon (High) */}
                                <div className="flex items-center justify-between p-3 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-xl group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600">
                                            <ShoppingCart size={14} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">Amazon.de</p>
                                            <div className="text-[10px] text-slate-400 flex items-center gap-1 group-hover:text-indigo-500">
                                                Zum Produkt <ExternalLink size={8} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-tech font-bold text-slate-900 dark:text-white">€{competitor1}</p>
                                        <p className="text-[10px] font-bold text-green-600 dark:text-green-400 flex items-center justify-end gap-1">
                                            <ArrowUpRight size={10} /> +15%
                                        </p>
                                    </div>
                                </div>

                                {/* Source 2: Idealo (Lower - Warning) */}
                                <div className="flex items-center justify-between p-3 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-xl group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                                            <TrendingDown size={14} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">Idealo Preisvergleich</p>
                                            <div className="text-[10px] text-slate-400 flex items-center gap-1 group-hover:text-indigo-500">
                                                Zum Angebot <ExternalLink size={8} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-tech font-bold text-slate-900 dark:text-white">€{competitor2}</p>
                                        <p className="text-[10px] font-bold text-red-500 flex items-center justify-end gap-1">
                                            <ArrowDownRight size={10} /> -2%
                                        </p>
                                    </div>
                                </div>

                                {/* Source 3: Google Shopping (Avg) */}
                                <div className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-xl group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                                            <Search size={14} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">Google Shopping</p>
                                            <div className="text-[10px] text-slate-400 flex items-center gap-1 group-hover:text-indigo-500">
                                                Suche öffnen <ExternalLink size={8} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-tech font-bold text-slate-900 dark:text-white">€{competitor3}</p>
                                        <p className="text-[10px] font-bold text-green-600 dark:text-green-400 flex items-center justify-end gap-1">
                                            <ArrowUpRight size={10} /> +5%
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Timeline Activity (New) */}
                        <div className="mb-8">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Clock size={16} /> Letzte Aktivitäten
                            </h4>
                            <div className="space-y-4 pl-2 border-l-2 border-slate-100 dark:border-slate-800 ml-2">
                                {timeline.map((item, idx) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={item.id} className="relative pl-6 pb-2">
                                            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                            </div>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">{item.text}</p>
                                            <p className="text-[10px] text-slate-400 font-mono">{item.time}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Description (Read Only) */}
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Beschreibung</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                {product.description || 'Keine Beschreibung verfügbar.'}
                            </p>
                        </div>

                        {/* Internal Tags */}
                        <div className="mt-6 flex flex-wrap gap-2">
                            {['Bestseller', 'Sommer24', 'Lager A'].map(tag => (
                                <span key={tag} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                                    <Tag size={10} /> {tag}
                                </span>
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

// Simple Icon Components for Timeline Mock
const ShoppingBagIcon = ({ size }: { size: number }) => <ShoppingCart size={size} />;
const RefreshIcon = ({ size }: { size: number }) => <Zap size={size} />;
const TagIcon = ({ size }: { size: number }) => <Tag size={size} />;