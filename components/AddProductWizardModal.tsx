import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Upload, Check, Globe, ShoppingBag, Store, Tag, DollarSign, Barcode, Layers, Image as ImageIcon, Box, Truck, Plus, Trash2, SlidersHorizontal, ChevronRight, Info, X, Wrench, Package, Maximize2, ShoppingCart, Sparkles, Wand2, Loader2, Zap, ArrowRightLeft, Database, Link, RefreshCw, Facebook, Instagram, Twitter, Video, Film, PlayCircle, Calculator, Percent, Ruler, Scale, Coins, TrendingDown, Clock, Search, ChevronLeft, ShieldCheck, AlertCircle, Eye, Smartphone, Music, Hash, MessageCircle, Share2, ThumbsUp, Heart } from 'lucide-react';
import { Product, Platform } from '../types';
import { Connection } from '../services/connectionService';

interface AddProductWizardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: Product) => void;
    credits: number;
    setCredits: React.Dispatch<React.SetStateAction<number>>;
    initialProduct?: Product | null;
    connections: Connection[];
}

interface VariantOption {
    id: string;
    name: string;
    values: string[];
    currentInput: string;
}

interface GeneratedVariant {
    id: string;
    title: string;
    price: string;
    comparePrice: string;
    costPerItem: string;
    stock: string;
    sku: string;
    barcode: string;
    image: string;
}

interface ConfigOption {
    id: string;
    name: string;
    priceModifier: string;
}

interface ConfigGroup {
    id: string;
    name: string;
    options: ConfigOption[];
}

// Product Types
type ProductType = 'simple' | 'configurable' | 'grouped' | 'bundle' | 'virtual' | 'downloadable' | 'subscription' | 'personalized' | 'bookable';

const PRODUCT_TYPES = [
    { id: 'simple' as ProductType, label: 'Einfaches Produkt', icon: Package, description: 'Standard-Produkt ohne Varianten' },
    { id: 'configurable' as ProductType, label: 'Variables Produkt', icon: SlidersHorizontal, description: 'Mit Größen, Farben etc.' },
    { id: 'personalized' as ProductType, label: 'Personalisierbar', icon: Wrench, description: 'Mit Gravur, Text-Optionen' },
    { id: 'virtual' as ProductType, label: 'Virtuell', icon: Globe, description: 'Kein physischer Versand' },
    { id: 'downloadable' as ProductType, label: 'Download', icon: Database, description: 'Digitale Dateien' },
    { id: 'bundle' as ProductType, label: 'Bundle', icon: Box, description: 'Mehrere Produkte zusammen' },
    { id: 'subscription' as ProductType, label: 'Abo', icon: RefreshCw, description: 'Wiederkehrende Zahlung' },
    { id: 'bookable' as ProductType, label: 'Buchbar', icon: Clock, description: 'Termine, Slots' },
];

// All possible wizard steps
const ALL_WIZARD_STEPS = [
    { id: 'product_type', label: 'Typ', icon: Package },
    { id: 'ai', label: 'AI Start', icon: Sparkles },
    { id: 'price_check', label: 'Preis Radar', icon: TrendingDown },
    { id: 'general', label: 'Basis', icon: Layers },
    { id: 'media', label: 'Medien', icon: ImageIcon },
    { id: 'tiktok', label: 'TikTok', icon: Video },
    { id: 'organization', label: 'Org', icon: Tag },
    { id: 'pricing', label: 'Preise', icon: DollarSign },
    { id: 'inventory', label: 'Lager', icon: Box },
    { id: 'variants', label: 'Varianten', icon: SlidersHorizontal },
    { id: 'shipping', label: 'Versand', icon: Truck },
    { id: 'configurator', label: 'Extras', icon: Wrench },
    { id: 'organization_channels', label: 'Kanäle', icon: Globe },
    { id: 'check', label: 'Prüfung', icon: ShieldCheck },
];

// Dynamic step filtering based on product type
const getStepsForProductType = (productType: ProductType | null): typeof ALL_WIZARD_STEPS => {
    if (!productType) return [ALL_WIZARD_STEPS[0]]; // Only show type selector

    const baseSteps = ['product_type', 'ai', 'price_check', 'general', 'media', 'organization', 'pricing', 'organization_channels', 'check'];

    const stepMap: Record<ProductType, string[]> = {
        simple: [...baseSteps.slice(0, 6), 'inventory', ...baseSteps.slice(6)],
        configurable: [...baseSteps.slice(0, 6), 'inventory', 'variants', 'shipping', ...baseSteps.slice(6)],
        personalized: [...baseSteps.slice(0, 6), 'inventory', 'configurator', 'shipping', ...baseSteps.slice(6)],
        virtual: baseSteps, // No shipping, no inventory
        downloadable: baseSteps, // No shipping, no inventory
        bundle: [...baseSteps.slice(0, 6), 'shipping', ...baseSteps.slice(6)],
        subscription: baseSteps,
        grouped: baseSteps,
        bookable: baseSteps,
    };

    const activeStepIds = stepMap[productType] || baseSteps;
    return ALL_WIZARD_STEPS.filter(step => activeStepIds.includes(step.id));
};

const AI_TONES = ['SEO-Optimiert 🚀', 'Locker & Cool 😎', 'Freundlich 😊', 'Witzig & Frech 😂'];

// Estimated fees in percent
const PLATFORM_FEES: Record<string, number> = {
    amazon: 15, ebay: 11, etsy: 6.5, tiktok: 5, instagram: 5, facebook: 5,
    shopify: 2, woocommerce: 0, bol: 12, shopware: 0, magento: 0,
    prestashop: 0, oxid: 0, x: 0
};

// Added mappingKeys to simulate platform specific variables
const AVAILABLE_CHANNELS = [
    { id: 'shopify', label: 'Shopify', sub: 'Global', icon: ShoppingBag, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', mappingKeys: ['title', 'body_html', 'images', 'variants', 'tags', 'sku'] },
    { id: 'woocommerce', label: 'WooCommerce', sub: 'Global', icon: Store, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', mappingKeys: ['name', 'description', 'images', 'regular_price', 'categories', 'weight'] },
    { id: 'tiktok', label: 'TikTok Shop', sub: 'Social', icon: Video, color: 'text-slate-900 dark:text-white', bg: 'bg-cyan-50 dark:bg-cyan-900/20', mappingKeys: ['title', 'description', 'sku', 'price', 'video_id', 'sound_id'] },
    { id: 'instagram', label: 'Instagram', sub: 'Meta Commerce', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-900/20', mappingKeys: ['name', 'description', 'image_url', 'price', 'retailer_id'] },
    { id: 'facebook', label: 'Facebook', sub: 'Meta Commerce', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', mappingKeys: ['name', 'message', 'link', 'full_picture', 'price'] },
    { id: 'amazon', label: 'Amazon EU', sub: 'Marketplace', icon: ShoppingCart, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', mappingKeys: ['ItemName', 'Description', 'MainImageURL', 'StandardPrice', 'ASIN'] },
    { id: 'ebay', label: 'eBay EU', sub: 'Marketplace', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', mappingKeys: ['Item.Title', 'Item.Description', 'Item.PictureDetails.PictureURL', 'Item.StartPrice'] },
    { id: 'google_shopping', label: 'Google Shopping', sub: 'Ads & Listings', icon: Search, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', mappingKeys: ['title', 'description', 'link', 'image_link', 'availability', 'price'] },
    { id: 'pinterest', label: 'Pinterest', sub: 'Social Catalog', icon: Share2, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', mappingKeys: ['title', 'description', 'link', 'image_link', 'price', 'availability'] },
    { id: 'etsy', label: 'Etsy', sub: 'Handmade', icon: Store, color: 'text-orange-700', bg: 'bg-orange-100 dark:bg-orange-900/20', mappingKeys: ['title', 'description', 'images', 'price', 'quantity'] },
    { id: 'shopware', label: 'Shopware', sub: 'DACH', icon: Layers, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', mappingKeys: ['name', 'description', 'media', 'price', 'stock'] },
    { id: 'magento', label: 'Magento', sub: 'Adobe', icon: Layers, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', mappingKeys: ['name', 'sku', 'price', 'media_gallery_entries'] },
    { id: 'prestashop', label: 'PrestaShop', sub: 'OSS', icon: ShoppingCart, color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-900/20', mappingKeys: ['name', 'description', 'price', 'active'] },
    { id: 'oxid', label: 'Oxid', sub: 'Enterprise', icon: Box, color: 'text-green-700', bg: 'bg-green-100 dark:bg-green-900/20', mappingKeys: ['OXTITLE', 'OXPRICE', 'OXSTOCK'] },
    { id: 'bol', label: 'Bol.com', sub: 'NL/BE', icon: Globe, color: 'text-blue-800', bg: 'bg-blue-100 dark:bg-blue-900/20', mappingKeys: ['EAN', 'Title', 'Price', 'Stock'] },
    { id: 'x', label: 'X Shopping', sub: 'Social', icon: Twitter, color: 'text-slate-900 dark:text-white', bg: 'bg-slate-100 dark:bg-slate-800', mappingKeys: ['text', 'product_id'] },
];

// Helper to determine source field based on target key
const getSourceLabel = (targetKey: string): string => {
    const k = targetKey.toLowerCase();
    if (k.includes('title') || k.includes('name') || k.includes('itemname')) return 'Titel';
    if (k.includes('price')) return 'Preis';
    if (k.includes('stock')) return 'Bestand';
    if (k.includes('desc') || k.includes('html')) return 'Beschreibung';
    if (k.includes('sku') || k.includes('asin')) return 'SKU';
    if (k.includes('image') || k.includes('pic') || k.includes('url') || k.includes('link')) return 'Bilder/Link';
    if (k.includes('video')) return 'Video';
    if (k.includes('weight')) return 'Gewicht';
    if (k.includes('cat')) return 'Kategorie';
    if (k.includes('tag')) return 'Tags';
    if (k.includes('sound')) return 'Audio';
    return 'Auto';
};

export const AddProductWizardModal: React.FC<AddProductWizardModalProps> = ({ isOpen, onClose, onSave, credits, setCredits, initialProduct, connections }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiTone, setAiTone] = useState(AI_TONES[0]);
    const [loadingChannelId, setLoadingChannelId] = useState<string | null>(null);
    const [autoCalcFees, setAutoCalcFees] = useState(false);
    const [isPriceMonitorActive, setIsPriceMonitorActive] = useState(false);
    const [productType, setProductType] = useState<ProductType | null>(null);
    const navRef = useRef<HTMLDivElement>(null);

    // Compute visible steps based on product type
    const WIZARD_STEPS = getStepsForProductType(productType);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'active',
        sku: '',
        barcode: '',
        price: '',
        comparePrice: '',
        costPerItem: '',
        stock: '',
        weight: '',
        length: '',
        width: '',
        height: '',
        shippingProfile: 'standard',
        channels: ['shopify'] as Platform[],
        category: 'Möbel',
        manufacturer: '',
        tags: ''
    });

    const [tiktokParams, setTiktokParams] = useState({
        sound: '',
        caption: '',
        hashtags: '#viral #trending #new',
        allowDuet: true,
        allowStitch: true
    });

    const [channelPrices, setChannelPrices] = useState<Record<string, string>>({});
    const [hasVariants, setHasVariants] = useState(false);
    const [options, setOptions] = useState<VariantOption[]>([]);
    const [generatedVariants, setGeneratedVariants] = useState<GeneratedVariant[]>([]);
    const [hasConfigurator, setHasConfigurator] = useState(false);
    const [configGroups, setConfigGroups] = useState<ConfigGroup[]>([]);

    // Initialize form
    useEffect(() => {
        if (isOpen) {
            if (initialProduct) {
                setFormData({
                    title: initialProduct.title || '',
                    description: '', // Mock
                    status: 'active',
                    sku: initialProduct.sku || '',
                    barcode: '',
                    price: initialProduct.price?.toString() || '',
                    comparePrice: '',
                    costPerItem: '',
                    stock: initialProduct.stock?.toString() || '',
                    weight: initialProduct.weight?.toString() || '',
                    length: initialProduct.dimensions?.length?.toString() || '',
                    width: initialProduct.dimensions?.width?.toString() || '',
                    height: initialProduct.dimensions?.height?.toString() || '',
                    shippingProfile: initialProduct.shippingProfile || 'standard',
                    channels: initialProduct.channels || [],
                    category: initialProduct.category || 'Möbel',
                    manufacturer: '',
                    tags: ''
                });
                setCurrentStepIndex(2);
            } else {
                setCurrentStepIndex(0);
                setProductType(null); // Reset product type
                setFormData({
                    title: '', description: '', status: 'active', sku: '', barcode: '', price: '', comparePrice: '', costPerItem: '',
                    stock: '', weight: '', length: '', width: '', height: '', shippingProfile: 'standard', channels: ['shopify'] as Platform[],
                    category: 'Möbel', manufacturer: '', tags: ''
                });
                setHasVariants(false);
                setOptions([]);
                setGeneratedVariants([]);
                setIsPriceMonitorActive(false);
                setTiktokParams({
                    sound: '',
                    caption: '',
                    hashtags: '#viral #trending #new',
                    allowDuet: true,
                    allowStitch: true
                });
            }
        }
    }, [isOpen, initialProduct]);

    useEffect(() => {
        if (isOpen && navRef.current) {
            // Scroll active step into view
            const activeBtn = navRef.current.children[currentStepIndex] as HTMLElement;
            if (activeBtn) {
                activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [currentStepIndex, isOpen]);

    useEffect(() => {
        if (autoCalcFees) {
            const basePrice = parseFloat(formData.price) || 0;
            const newPrices = { ...channelPrices };
            formData.channels.forEach(channelId => {
                const feePercent = PLATFORM_FEES[channelId] || 0;
                const feeAmount = basePrice * (feePercent / 100);
                newPrices[channelId] = (basePrice + feeAmount).toFixed(2);
            });
            setChannelPrices(newPrices);
        }
    }, [formData.price, formData.channels, autoCalcFees]);

    useEffect(() => {
        if (hasVariants) {
            const validOptions = options.filter(o => o.values.length > 0);
            if (validOptions.length === 0) { setGeneratedVariants([]); return; }

            let combos: { title: string }[] = [];
            if (validOptions.length === 1) combos = validOptions[0].values.map(v => ({ title: v }));
            else if (validOptions.length >= 2) {
                validOptions[0].values.forEach(v1 => validOptions[1].values.forEach(v2 => combos.push({ title: `${v1} / ${v2}` })));
            }

            setGeneratedVariants(combos.map(c => ({
                id: `var_${Math.random().toString(36).substring(2, 9)}`,
                title: c.title,
                price: formData.price,
                comparePrice: formData.comparePrice,
                costPerItem: formData.costPerItem,
                stock: '0',
                sku: `${formData.sku}-${c.title.substring(0, 3).toUpperCase()}`,
                barcode: '',
                image: ''
            })));
        }
    }, [options, hasVariants, formData.price, formData.sku, formData.comparePrice, formData.costPerItem]);

    const toggleChannel = (channelId: string) => {
        const platform = channelId as Platform;
        if (formData.channels.includes(platform)) {
            setFormData(prev => ({ ...prev, channels: prev.channels.filter(c => c !== platform) }));
        } else {
            setLoadingChannelId(channelId);
            setTimeout(() => {
                setFormData(prev => ({ ...prev, channels: [...prev.channels, platform] }));
                if (autoCalcFees) {
                    const basePrice = parseFloat(formData.price) || 0;
                    const feePercent = PLATFORM_FEES[platform] || 0;
                    const finalPrice = (basePrice + (basePrice * feePercent / 100)).toFixed(2);
                    setChannelPrices(prev => ({ ...prev, [platform]: finalPrice }));
                } else {
                    setChannelPrices(prev => ({ ...prev, [platform]: formData.price }));
                }
                setLoadingChannelId(null);
            }, 400);
        }
    };

    const handleAIGenerate = () => {
        if (credits < 1) { alert("Nicht genügend Credits!"); return; }
        setIsGenerating(true);
        setCredits(prev => prev - 1);

        setTimeout(() => {
            setFormData({
                ...formData,
                title: 'Premium Vintage Leder Weekender',
                description: 'Handgefertigte Reisetasche aus echtem Leder. Perfekt für Wochenendtrips.',
                price: '249.00',
                comparePrice: '329.00',
                costPerItem: '85.00',
                sku: 'BAG-LTHR-WKND-01',
                barcode: '4006381333931',
                stock: '15',
                weight: '1.8',
                length: '55',
                width: '30',
                height: '25',
                shippingProfile: 'standard',
                category: 'Reisegepäck',
                manufacturer: 'Heritage Goods',
                tags: 'Leder, Reise, Premium',
                channels: ['shopify', 'amazon', 'tiktok']
            });
            setTiktokParams({
                sound: 'Relaxed Travel Vibes - Original',
                caption: 'Bereit für das nächste Abenteuer? ✈️ Unser Vintage Weekender ist der perfekte Begleiter. #travel #vintage #leather',
                hashtags: '#travel #vintage #leather #fashion #style',
                allowDuet: true,
                allowStitch: true
            });
            setHasVariants(true);
            setOptions([{ id: 'opt_gen_1', name: 'Farbe', values: ['Cognac', 'Schwarz'], currentInput: '' }]);
            setIsGenerating(false);
            handleNextStep();
        }, 2000);
    };

    const addOption = () => setOptions([...options, { id: `opt_${Date.now()}`, name: '', values: [], currentInput: '' }]);
    const removeOption = (id: string) => setOptions(options.filter(o => o.id !== id));
    const updateOptionName = (id: string, name: string) => setOptions(options.map(o => o.id === id ? { ...o, name } : o));
    const addOptionValue = (id: string, value: string) => {
        if (!value.trim()) return;
        setOptions(options.map(o => o.id === id && !o.values.includes(value.trim()) ? { ...o, values: [...o.values, value.trim()], currentInput: '' } : o));
    };
    const removeOptionValue = (optionId: string, value: string) => setOptions(options.map(o => o.id === optionId ? { ...o, values: o.values.filter(v => v !== value) } : o));

    const addConfigGroup = () => {
        const newGroup: ConfigGroup = {
            id: `grp_${Date.now()}`,
            name: '',
            options: [{ id: `copt_${Date.now()}_1`, name: '', priceModifier: '' }]
        };
        setConfigGroups([...configGroups, newGroup]);
    };

    const removeConfigGroup = (groupId: string) => {
        setConfigGroups(configGroups.filter(g => g.id !== groupId));
    };

    const updateConfigGroupName = (groupId: string, name: string) => {
        setConfigGroups(configGroups.map(g => g.id === groupId ? { ...g, name } : g));
    };

    const addConfigOptionToGroup = (groupId: string) => {
        setConfigGroups(configGroups.map(g => {
            if (g.id === groupId) {
                return {
                    ...g,
                    options: [...g.options, { id: `copt_${Date.now()}`, name: '', priceModifier: '' }]
                };
            }
            return g;
        }));
    };

    const removeConfigOption = (groupId: string, optionId: string) => {
        setConfigGroups(configGroups.map(g => {
            if (g.id === groupId) {
                return { ...g, options: g.options.filter(o => o.id !== optionId) };
            }
            return g;
        }));
    };

    const updateConfigOption = (groupId: string, optionId: string, field: 'name' | 'priceModifier', value: string) => {
        setConfigGroups(configGroups.map(g => {
            if (g.id === groupId) {
                const newOptions = g.options.map(o => o.id === optionId ? { ...o, [field]: value } : o);
                return { ...g, options: newOptions };
            }
            return g;
        }));
    };

    const handleNextStep = () => { if (currentStepIndex < WIZARD_STEPS.length - 1) setCurrentStepIndex(prev => prev + 1); };
    const handlePrevStep = () => { if (currentStepIndex > 0) setCurrentStepIndex(prev => prev - 1); };

    const handleSubmit = () => {
        setLoading(true);
        setTimeout(() => {
            const newProduct: Product = {
                id: initialProduct?.id || `prod_${Date.now()}`,
                title: formData.title || 'Neues Produkt',
                sku: formData.sku,
                price: parseFloat(formData.price) || 0,
                stock: parseInt(formData.stock) || 0,
                imageUrl: initialProduct?.imageUrl || `https://picsum.photos/400/400?random=${Date.now()}`,
                channels: formData.channels,
                lastSync: new Date().toISOString(),
                category: formData.category,
                weight: parseFloat(formData.weight) || 0,
                dimensions: {
                    length: parseFloat(formData.length) || 0,
                    width: parseFloat(formData.width) || 0,
                    height: parseFloat(formData.height) || 0
                },
                shippingProfile: formData.shippingProfile
            };
            onSave(newProduct);
            setLoading(false);
            onClose();
        }, 800);
    };

    if (!isOpen) return null;

    // --- RENDER CONTENT ---
    const renderContent = () => {
        switch (WIZARD_STEPS[currentStepIndex].id) {
            case 'product_type':
                return (
                    <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welchen Produkttyp möchten Sie anlegen?</h3>
                            <p className="text-slate-500 dark:text-slate-400">Wählen Sie den passenden Typ für Ihr Produkt</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {PRODUCT_TYPES.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => {
                                        setProductType(type.id);
                                        handleNextStep();
                                    }}
                                    className={`p-6 rounded-2xl border-2 text-left transition-all hover:scale-105 ${productType === type.id
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 ring-2 ring-indigo-500'
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                            <type.icon size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-900 dark:text-white mb-1">{type.label}</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{type.description}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'ai':
                return (
                    <div className="flex flex-col items-center justify-center h-full py-4 sm:py-8 text-center space-y-6 sm:space-y-8 animate-in zoom-in-95 duration-300 -mt-[30px] sm:mt-0">
                        <div className="relative group cursor-pointer">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <div className="relative w-32 h-32 rounded-[2rem] bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800 dark:to-slate-900 border-2 border-dashed border-indigo-200 dark:border-indigo-800 flex flex-col items-center justify-center hover:border-indigo-500 transition-colors">
                                <Upload className="text-indigo-400 mb-2" size={32} />
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Bild hier ablegen</span>
                            </div>
                        </div>
                        <div className="w-full max-w-md space-y-4 px-4 sm:px-0">
                            <h3 className="text-xl sm:text-2xl font-display font-bold text-slate-900 dark:text-white">Magic Product Creator</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">Laden Sie ein Foto hoch. Unsere KI erkennt das Produkt, schreibt die Beschreibung und setzt die Attribute.</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {AI_TONES.map(tone => (
                                    <button key={tone} onClick={() => setAiTone(tone)} className={`text-xs px-3 py-1.5 rounded-full border transition-all ${aiTone === tone ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                                        {tone.split(' ')[0]}
                                    </button>
                                ))}
                            </div>
                            <button onClick={handleAIGenerate} disabled={isGenerating} className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-base sm:text-lg">
                                {isGenerating ? <Loader2 className="animate-spin" /> : <Wand2 />}
                                <span>Generieren (1 Credit)</span>
                            </button>
                        </div>
                    </div>
                );
            case 'price_check':
                return (
                    <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-5 lg:p-8 rounded-[2rem] border border-emerald-100/50 dark:border-emerald-800/50 shadow-sm relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                            <div className="flex justify-between items-start relative z-10">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 ring-4 ring-white/50 dark:ring-slate-700/50">
                                        <TrendingDown size={28} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-xl mb-1">Preis-Radar</h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg">
                                            Findet automatisch das günstigste Konkurrenzangebot im Web. Auf Wunsch passen wir Ihren Preis dynamisch an.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex flex-col sm:flex-row gap-3 relative z-10">
                                <div className="bg-white/60 dark:bg-slate-800/60 px-4 py-3 sm:py-2 rounded-xl border border-emerald-100 dark:border-emerald-800 flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center sm:justify-start">
                                    <Clock size={16} className="text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Check-Intervall: <span className="font-bold">1 Stunde</span>
                                    </span>
                                </div>
                                <div className="bg-white/60 dark:bg-slate-800/60 px-4 py-3 sm:py-2 rounded-xl border border-emerald-100 dark:border-emerald-800 flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center sm:justify-start">
                                    <Coins size={16} className="text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Kosten: <span className="font-bold">5 Credits / Monat</span>
                                    </span>
                                </div>
                            </div>
                            <button
                                className={`w-full mt-6 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 relative z-10 ${isPriceMonitorActive
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-500/50 shadow-none'
                                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5'
                                    }`}
                                onClick={() => {
                                    if (isPriceMonitorActive) {
                                        setIsPriceMonitorActive(false);
                                    } else {
                                        if (credits < 5) {
                                            alert('Nicht genügend Credits für das Abo (5 Credits benötigt).');
                                        } else {
                                            setCredits(prev => prev - 5);
                                            setIsPriceMonitorActive(true);
                                        }
                                    }
                                }}
                            >
                                {isPriceMonitorActive ? (
                                    <>
                                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-sm">
                                            <Check size={14} strokeWidth={4} />
                                        </div>
                                        Überwachung aktiv
                                    </>
                                ) : (
                                    <>
                                        <Search size={20} />
                                        Analyse starten & Überwachung aktivieren
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                );
            case 'general':
                return (
                    <div className="space-y-5 animate-in slide-in-from-right-8 duration-300">
                        <div><label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Titel</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white font-medium" placeholder="Produktname" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} autoFocus /></div>
                        <div><label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Beschreibung</label><textarea rows={6} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white" placeholder="Details..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
                    </div>
                );
            case 'media':
                return (
                    <div className="space-y-8 animate-in slide-in-from-right-8 duration-300">
                        <div>
                            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3 ml-1 flex items-center gap-2">
                                <ImageIcon size={16} /> Produktbilder
                            </label>
                            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-8 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-800/50 min-h-[140px]">
                                <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center mb-3 text-slate-400">
                                    <Upload size={20} />
                                </div>
                                <p className="font-medium text-slate-700 dark:text-slate-300 text-sm">Bilder hochladen</p>
                                <p className="text-[10px] mt-1 opacity-70">PNG, JPG (max. 5MB)</p>
                            </div>
                            <div className="grid grid-cols-4 gap-3 mt-4">
                                {[1, 2].map((i) => (
                                    <div key={i} className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 border border-slate-100 dark:border-slate-700 relative overflow-hidden group">
                                        <img src={`https://picsum.photos/200?random=${i}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                        <button className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                                    </div>
                                ))}
                                <div className="aspect-square bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center text-slate-300 border border-slate-100 dark:border-slate-700 border-dashed">
                                    <Plus size={20} />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'tiktok':
                return (
                    <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400">
                                <Video size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-lg">TikTok Integration</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Videos für Reels & TikTok optimieren</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="aspect-[9/16] bg-slate-900 rounded-[2rem] relative overflow-hidden group shadow-xl border-4 border-slate-900 dark:border-slate-800 mx-auto w-64 md:w-full">
                                    <div className="absolute top-4 inset-x-0 flex justify-center z-20">
                                        <div className="w-16 h-1 bg-white/30 rounded-full"></div>
                                    </div>
                                    <div className="absolute bottom-6 right-4 z-20 flex flex-col gap-4 items-center">
                                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"><Heart size={20} className="text-white fill-white" /></div>
                                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"><MessageCircle size={20} className="text-white fill-white" /></div>
                                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"><Share2 size={20} className="text-white fill-white" /></div>
                                    </div>
                                    <div className="absolute bottom-6 left-4 z-20 text-white max-w-[70%]">
                                        <p className="font-bold text-sm mb-1">@DeinShop</p>
                                        <p className="text-xs opacity-90 line-clamp-2">{tiktokParams.caption || 'Beschreibe dein Video...'}</p>
                                        <div className="flex items-center gap-2 mt-2 opacity-80 text-[10px]">
                                            <Music size={10} />
                                            <span className="truncate w-24">{tiktokParams.sound || 'Original Audio'}</span>
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 text-slate-400 cursor-pointer hover:bg-slate-700 transition-colors">
                                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                                            <Upload size={24} className="text-white" />
                                        </div>
                                        <span className="font-bold text-sm text-white">Video hochladen</span>
                                        <span className="text-xs opacity-60 mt-1">9:16 Format</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-5">
                                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                                            <Music size={12} /> Sound / Audio
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Suche nach Sounds (z.B. Trending Pop)"
                                            className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-sm transition-all"
                                            value={tiktokParams.sound}
                                            onChange={(e) => setTiktokParams({ ...tiktokParams, sound: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                                            <MessageCircle size={12} /> Caption
                                        </label>
                                        <textarea
                                            rows={3}
                                            placeholder="Beschreibe dein Video..."
                                            className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-sm resize-none transition-all"
                                            value={tiktokParams.caption}
                                            onChange={(e) => setTiktokParams({ ...tiktokParams, caption: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                                            <Hash size={12} /> Hashtags
                                        </label>
                                        <textarea
                                            rows={2}
                                            placeholder="#fyp #viral"
                                            className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-sm resize-none text-pink-500 font-medium transition-all"
                                            value={tiktokParams.hashtags}
                                            onChange={(e) => setTiktokParams({ ...tiktokParams, hashtags: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Duet erlauben</span>
                                        <button
                                            onClick={() => setTiktokParams({ ...tiktokParams, allowDuet: !tiktokParams.allowDuet })}
                                            className={`w-10 h-6 rounded-full transition-colors flex items-center p-1 ${tiktokParams.allowDuet ? 'bg-pink-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${tiktokParams.allowDuet ? 'translate-x-4' : ''}`}></div>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Stitch erlauben</span>
                                        <button
                                            onClick={() => setTiktokParams({ ...tiktokParams, allowStitch: !tiktokParams.allowStitch })}
                                            className={`w-10 h-6 rounded-full transition-colors flex items-center p-1 ${tiktokParams.allowStitch ? 'bg-pink-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${tiktokParams.allowStitch ? 'translate-x-4' : ''}`}></div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'organization':
                return (
                    <div className="space-y-5 animate-in slide-in-from-right-8 duration-300">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-sm font-bold ml-1">Kategorie</label><select className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border-none text-slate-900 dark:text-white" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}><option>Möbel</option><option>Mode</option><option>Elektronik</option></select></div>
                            <div><label className="text-sm font-bold ml-1">Hersteller</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border-none text-slate-900 dark:text-white" placeholder="Brand" value={formData.manufacturer} onChange={e => setFormData({ ...formData, manufacturer: e.target.value })} /></div>
                        </div>
                        <div><label className="text-sm font-bold ml-1">Tags</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border-none text-slate-900 dark:text-white" placeholder="Komma getrennt..." value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} /></div>
                    </div>
                );
            case 'pricing':
                return (
                    <div className="space-y-5 animate-in slide-in-from-right-8 duration-300">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-sm font-bold ml-1">Preis (€)</label><input type="number" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border-none text-slate-900 dark:text-white font-bold text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="0.00" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} autoFocus /></div>
                            <div><label className="text-sm font-bold ml-1">Vergleich (€)</label><input type="number" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border-none text-slate-900 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="0.00" value={formData.comparePrice} onChange={e => setFormData({ ...formData, comparePrice: e.target.value })} /></div>
                        </div>
                        <div><label className="text-sm font-bold ml-1">Kosten pro Artikel (€)</label><input type="number" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border-none text-slate-900 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="0.00" value={formData.costPerItem} onChange={e => setFormData({ ...formData, costPerItem: e.target.value })} /></div>
                        <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl"><div className="flex items-center gap-2"><Calculator size={18} className="text-indigo-600" /><span className="text-sm font-bold text-indigo-900 dark:text-indigo-300">Gebühren-Auto-Calc</span></div><button onClick={() => setAutoCalcFees(!autoCalcFees)} className={`w-10 h-6 rounded-full transition-colors ${autoCalcFees ? 'bg-indigo-600' : 'bg-slate-300'}`}><div className={`w-4 h-4 bg-white rounded-full transition-transform transform ml-1 mt-1 ${autoCalcFees ? 'translate-x-4' : ''}`} /></button></div>
                    </div>
                );
            case 'inventory':
                return (
                    <div className="space-y-5 animate-in slide-in-from-right-8 duration-300">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-sm font-bold ml-1">SKU</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border-none text-slate-900 dark:text-white font-mono" placeholder="ABC-123" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} /></div>
                            <div><label className="text-sm font-bold ml-1">Barcode</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border-none text-slate-900 dark:text-white font-mono" placeholder="EAN" value={formData.barcode} onChange={e => setFormData({ ...formData, barcode: e.target.value })} /></div>
                        </div>
                        <div><label className="text-sm font-bold ml-1">Lagerbestand</label><input type="number" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border-none text-slate-900 dark:text-white font-bold text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="0" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} /></div>
                    </div>
                );
            case 'variants':
                return (
                    <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                        <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                            <span className="font-bold text-slate-900 dark:text-white">Varianten aktivieren</span>
                            <button onClick={() => setHasVariants(!hasVariants)} className={`w-10 h-6 rounded-full transition-colors ${hasVariants ? 'bg-indigo-600' : 'bg-slate-300'}`}><div className={`w-4 h-4 bg-white rounded-full transition-transform transform ml-1 mt-1 ${hasVariants ? 'translate-x-4' : ''}`} /></button>
                        </div>
                        {hasVariants && (
                            <div className="space-y-4">
                                {options.map((opt, idx) => (
                                    <div key={opt.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-xl">
                                        <div className="flex justify-between mb-2"><span className="text-xs font-bold uppercase text-slate-400">Option {idx + 1}</span><button onClick={() => removeOption(opt.id)}><Trash2 size={14} className="text-red-400" /></button></div>
                                        <input type="text" className="w-full mb-2 p-2 bg-white dark:bg-slate-900 rounded-lg text-sm font-bold border border-slate-200 dark:border-slate-700" placeholder="Name (z.B. Größe)" value={opt.name} onChange={e => updateOptionName(opt.id, e.target.value)} />
                                        <div className="flex flex-wrap gap-2 mb-2">{opt.values.map(v => <span key={v} className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs px-2 py-1 rounded-md font-bold">{v} <button onClick={() => removeOptionValue(opt.id, v)}>&times;</button></span>)}</div>
                                        <input type="text" className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg text-sm border border-slate-200 dark:border-slate-700" placeholder="Wert hinzufügen + Enter" value={opt.currentInput} onChange={e => setOptions(options.map(o => o.id === opt.id ? { ...o, currentInput: e.target.value } : o))} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addOptionValue(opt.id, opt.currentInput); } }} />
                                    </div>
                                ))}
                                {options.length < 3 && <button onClick={addOption} className="w-full py-3 border border-dashed border-indigo-200 text-indigo-500 rounded-xl text-sm font-bold">+ Option</button>}
                            </div>
                        )}
                    </div>
                );
            case 'shipping':
                return (
                    <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl text-sm text-blue-700 dark:text-blue-300 flex items-start gap-3 border border-blue-100 dark:border-blue-800">
                            <Truck size={18} className="shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold mb-1">Versandprofile</p>
                                <p>Definieren Sie Gewicht und Maße für die korrekte Berechnung der Versandkosten auf allen Kanälen.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">Versandprofil</label>
                                <select
                                    className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white appearance-none"
                                    value={formData.shippingProfile}
                                    onChange={(e) => setFormData({ ...formData, shippingProfile: e.target.value })}
                                >
                                    <option value="standard">Standard Versand (DHL Paket)</option>
                                    <option value="express">Express Versand</option>
                                    <option value="bulky">Sperrgut / Spedition</option>
                                    <option value="letter">Warensendung / Brief</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">Gewicht</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Scale size={16} /></span>
                                    <input
                                        type="number"
                                        className="w-full pl-10 pr-12 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        placeholder="0.0"
                                        value={formData.weight}
                                        onChange={e => setFormData({ ...formData, weight: e.target.value })}
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">kg</span>
                                </div>
                            </div>

                            <div className="md:col-span-2 grid grid-cols-3 gap-4">
                                <div className="relative">
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase">Länge</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            placeholder="0"
                                            value={formData.length}
                                            onChange={e => setFormData({ ...formData, length: e.target.value })}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">cm</span>
                                    </div>
                                </div>
                                <div className="relative">
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase">Breite</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            placeholder="0"
                                            value={formData.width}
                                            onChange={e => setFormData({ ...formData, width: e.target.value })}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">cm</span>
                                    </div>
                                </div>
                                <div className="relative">
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase">Höhe</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            placeholder="0"
                                            value={formData.height}
                                            onChange={e => setFormData({ ...formData, height: e.target.value })}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">cm</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'organization_channels':
                // FILTER LOGIC: Get unique platform IDs from active connections
                const activePlatformIds = Array.from(new Set(connections.map(c => c.platform)));
                // Filter available channels to show only active ones
                const activeChannels = AVAILABLE_CHANNELS.filter(c => activePlatformIds.includes(c.id as Platform));

                return (
                    <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Wählen Sie die Kanäle für den sofortigen Sync:</p>

                        {activeChannels.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3">
                                {activeChannels.map(c => (
                                    <button key={c.id} onClick={() => toggleChannel(c.id)} className={`p-3 rounded-xl border text-left transition-all ${formData.channels.includes(c.id as Platform) ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100'}`}>
                                        <div className="flex items-center gap-2 mb-1"><c.icon size={16} className={c.color} /><span className="font-bold text-sm dark:text-white">{c.label}</span></div>
                                        <span className="text-[10px] text-slate-400 block">{c.sub}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-3">
                                    <Globe size={24} />
                                </div>
                                <h4 className="font-bold text-slate-900 dark:text-white">Keine aktiven Kanäle</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">Bitte fügen Sie zuerst im Bereich "Kanäle" eine Verbindung hinzu.</p>
                            </div>
                        )}

                        {/* Smart Mapping Visualization */}
                        {formData.channels.length > 0 && (
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 md:p-5 border border-slate-200 dark:border-slate-700 mt-2">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm text-indigo-600 dark:text-indigo-400">
                                        <Zap size={16} fill="currentColor" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">Smart Mapping Aktiv</h4>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Automatische Zuweisung der Felder.</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {formData.channels.map(channelId => {
                                        const channel = AVAILABLE_CHANNELS.find(c => c.id === channelId);
                                        if (!channel) return null;
                                        return (
                                            <div key={channelId} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl p-3 shadow-sm flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${channel.color.replace('text', 'bg')}`}></div>
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{channel.label}</span>
                                                </div>

                                                <div className="flex flex-wrap gap-1.5">
                                                    {channel.mappingKeys?.slice(0, 4).map(key => {
                                                        const sourceLabel = getSourceLabel(key);
                                                        return (
                                                            <div key={key} className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700">
                                                                <span className="text-[9px] text-indigo-400 font-bold">{sourceLabel}</span>
                                                                <ArrowRightLeft size={8} className="text-slate-300 dark:text-slate-600" />
                                                                <span className="text-[9px] font-mono text-slate-500">{key}</span>
                                                            </div>
                                                        );
                                                    })}
                                                    <span className="text-[9px] text-slate-400 self-center">+ more</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'configurator':
                return (
                    <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white">Konfigurator aktivieren</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Kostenpflichtige Extras (z.B. Gravur)</p>
                            </div>
                            <button
                                onClick={() => setHasConfigurator(!hasConfigurator)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hasConfigurator ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hasConfigurator ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        {hasConfigurator && (
                            <div className="space-y-6">
                                {configGroups.map((group) => (
                                    <div key={group.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-700">
                                            <input
                                                type="text"
                                                placeholder="Gruppenname (z.B. Veredelung)"
                                                className="bg-transparent font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none w-full text-lg"
                                                value={group.name}
                                                onChange={(e) => updateConfigGroupName(group.id, e.target.value)}
                                            />
                                            <button onClick={() => removeConfigGroup(group.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded-lg">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {group.options.map((opt) => (
                                                <div key={opt.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                                    <div className="flex-1">
                                                        <input
                                                            type="text"
                                                            placeholder="Option (z.B. Goldrand)"
                                                            className="w-full text-sm bg-transparent focus:outline-none text-slate-900 dark:text-white font-medium"
                                                            value={opt.name}
                                                            onChange={(e) => updateConfigOption(group.id, opt.id, 'name', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="w-28 relative">
                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">+</span>
                                                        <input
                                                            type="number"
                                                            placeholder="0.00"
                                                            className="w-full pl-5 pr-6 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-right text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            value={opt.priceModifier}
                                                            onChange={(e) => updateConfigOption(group.id, opt.id, 'priceModifier', e.target.value)}
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => removeConfigOption(group.id, opt.id)}
                                                        className="text-slate-400 hover:text-red-500 p-1"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => addConfigOptionToGroup(group.id)}
                                                className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 mt-2 px-2"
                                            >
                                                <Plus size={14} /> Option hinzufügen
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={addConfigGroup}
                                    className="w-full py-3 border border-dashed border-indigo-200 dark:border-indigo-800 rounded-xl text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus size={18} />
                                    Neue Gruppe hinzufügen
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 'check':
                return (
                    <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                        {/* Health Score Header */}
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-emerald-500/20">
                            <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 relative flex items-center justify-center shrink-0">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="50%" cy="50%" r="45%" stroke="rgba(255,255,255,0.2)" strokeWidth="6" fill="transparent" />
                                        <circle cx="50%" cy="50%" r="45%" stroke="white" strokeWidth="6" fill="transparent" strokeDasharray={226} strokeDashoffset={226 - (226 * 95) / 100} strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                        <span className="text-xl sm:text-2xl font-bold">95</span>
                                        <span className="text-[8px] uppercase tracking-wider opacity-80">Score</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl sm:text-2xl font-bold mb-1">Bereit für Sync 🚀</h3>
                                    <p className="text-emerald-50 text-sm opacity-90 leading-relaxed">Ihr Produkt ist optimal konfiguriert. Alle Pflichtfelder für {formData.channels.length} Kanäle sind ausgefüllt.</p>
                                </div>
                            </div>
                        </div>

                        {/* Status Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Globe size={16} className="text-indigo-500" /> Kanal-Check
                                </h4>
                                <div className="space-y-3">
                                    {formData.channels.map(c => {
                                        const ch = AVAILABLE_CHANNELS.find(ac => ac.id === c);
                                        return (
                                            <div key={c} className="flex items-center justify-between text-sm">
                                                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                    <div className={`w-2 h-2 rounded-full ${ch?.color.replace('text', 'bg') || 'bg-slate-400'}`}></div>
                                                    {ch?.label || c}
                                                </span>
                                                <span className="text-green-500 font-bold text-xs flex items-center gap-1"><Check size={12} /> Ready</span>
                                            </div>
                                        );
                                    })}
                                    {formData.channels.length === 0 && <p className="text-xs text-slate-400 italic">Keine Kanäle ausgewählt</p>}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Search size={16} className="text-blue-500" /> SEO-Vorschau
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-300">Titel-Länge</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 w-[80%]"></div>
                                            </div>
                                            <span className="text-xs font-bold text-green-500">Gut</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-300">Beschreibung</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 w-[95%]"></div>
                                            </div>
                                            <span className="text-xs font-bold text-green-500">Perfekt</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-300">Bilder</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-orange-400 w-[40%]"></div>
                                            </div>
                                            <span className="text-xs font-bold text-orange-400">1 Bild</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Preview Card */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700 overflow-hidden">
                                {initialProduct?.imageUrl ? <img src={initialProduct.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon size={24} className="text-slate-300" />}
                            </div>
                            <div>
                                <h5 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{formData.title || 'Produktname'}</h5>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{formData.description || 'Keine Beschreibung'}</p>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xs">{formData.price} €</span>
                                    <span className="text-slate-400 text-[10px] uppercase font-bold">{formData.sku || 'NO-SKU'}</span>
                                </div>
                            </div>
                            <div className="ml-auto">
                                <button className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 dark:border-slate-600">
                                    <Eye size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            default: return <div className="p-10 text-center text-slate-400">Inhalt folgt...</div>;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity animate-in fade-in" onClick={onClose} />

            <div className="relative w-full max-w-4xl bg-white dark:bg-slate-950 rounded-none md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-full md:h-auto md:max-h-[90vh] animate-in zoom-in-95 duration-300 border-0 md:border border-white/20">

                {/* Header with Navigation */}
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl z-20 flex flex-col gap-4">
                    <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-4">
                            <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <X size={20} className="text-slate-600 dark:text-slate-300" />
                            </button>
                            <div>
                                <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">{initialProduct ? 'Produkt bearbeiten' : 'Neues Produkt'}</h2>
                                <p className="text-xs text-slate-500 font-medium">
                                    {initialProduct ? 'Änderungen vornehmen' : `Schritt ${currentStepIndex + 1} von ${WIZARD_STEPS.length}`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Navigation Bar */}
                    <div className="hidden md:flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1" ref={navRef}>
                        {WIZARD_STEPS.map((step, idx) => (
                            <button
                                key={step.id}
                                onClick={() => setCurrentStepIndex(idx)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium whitespace-nowrap border ${currentStepIndex === idx
                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 shadow-sm'
                                    : 'bg-transparent border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                                    }`}
                            >
                                {React.createElement(step.icon, { size: 16, className: currentStepIndex === idx ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400' })}
                                {step.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#f8f9fc] dark:bg-[#0b0f19] relative">
                    <div className="max-w-2xl mx-auto p-8">
                        {/* Mobile Stepper - Fixed non-scrolling text */}
                        <div className="md:hidden mb-6">
                            <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-2">
                                <div className="flex items-center gap-3">
                                    {React.createElement(WIZARD_STEPS[currentStepIndex].icon, { size: 24 })}
                                    <h3 className="text-xl font-bold font-serif-display text-slate-900 dark:text-white">{WIZARD_STEPS[currentStepIndex].label}</h3>
                                </div>
                                {/* Mobile Progress Bar */}
                                <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-600 transition-all duration-300"
                                        style={{ width: `${((currentStepIndex + 1) / WIZARD_STEPS.length) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                            {/* Mobile Quick Jump Icons */}
                            <div className="flex gap-4 overflow-x-auto scrollbar-hide py-2">
                                {WIZARD_STEPS.map((step, idx) => (
                                    <button
                                        key={step.id}
                                        onClick={() => setCurrentStepIndex(idx)}
                                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border transition-all ${currentStepIndex === idx
                                            ? 'bg-indigo-600 text-white border-indigo-600'
                                            : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                                            }`}
                                    >
                                        <step.icon size={18} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Desktop Stepper Title (Hidden as we have top nav now) */}
                        {/* 
                <div className="mb-6 hidden md:flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
                    {React.createElement(WIZARD_STEPS[currentStepIndex].icon, { size: 24 })}
                    <h3 className="text-2xl font-bold font-serif-display text-slate-900 dark:text-white">{WIZARD_STEPS[currentStepIndex].label}</h3>
                </div> 
                */}

                        {renderContent()}
                    </div>
                </div>

                {/* Sticky Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-20 flex justify-between items-center">
                    <button
                        onClick={handlePrevStep}
                        disabled={currentStepIndex === 0}
                        className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Zurück
                    </button>

                    {currentStepIndex === WIZARD_STEPS.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-all"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Check />}
                            {initialProduct ? 'Änderungen speichern' : 'Speichern & Sync'}
                        </button>
                    ) : (
                        <button
                            onClick={handleNextStep}
                            className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:scale-105 shadow-lg flex items-center gap-2 transition-all"
                        >
                            {currentStepIndex === 0 && !formData.title && !initialProduct ? 'Überspringen' : 'Weiter'} <ChevronRight size={18} />
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};