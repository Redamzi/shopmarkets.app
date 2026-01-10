import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, Check, Globe, ShoppingBag, Store, Tag, DollarSign, Barcode, Layers, Image as ImageIcon, Box, Truck, Plus, Trash2, SlidersHorizontal, ChevronRight, Info, X, Wrench, Package, Maximize2, ShoppingCart, Sparkles, Wand2, Loader2, Zap, ArrowRightLeft, Database, Link, RefreshCw, Facebook, Instagram, Twitter, Video, Film, PlayCircle, Calculator, Percent, Ruler, Scale, Coins, TrendingDown, Clock, Search, ChevronLeft } from 'lucide-react';
import { Product, Platform } from '../types';
import { mediaService } from '../services/mediaService';

interface AddProductPageProps {
    onSave: (product: Product) => void;
    onCancel: () => void;
    credits: number;
    setCredits: React.Dispatch<React.SetStateAction<number>>;
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

// Wizard Steps Definition
const WIZARD_STEPS = [
    { id: 'ai', label: 'AI Start', icon: Sparkles },
    { id: 'general', label: 'Basis-Daten', icon: Layers },
    { id: 'organization', label: 'Organisation', icon: Tag },
    { id: 'media', label: 'Medien', icon: ImageIcon },
    { id: 'pricing', label: 'Preise', icon: DollarSign },
    { id: 'inventory', label: 'Inventar', icon: Box },
    { id: 'variants', label: 'Varianten', icon: SlidersHorizontal },
    { id: 'shipping', label: 'Versand', icon: Truck },
    { id: 'configurator', label: 'Extras', icon: Wrench },
    { id: 'organization_channels', label: 'Kanäle', icon: Globe }, // Special ID for last step
];

type SectionId = 'ai' | 'general' | 'media' | 'pricing' | 'variants' | 'shipping' | 'configurator' | 'inventory' | 'organization';

const OPTION_PRESETS = ['Größe', 'Farbe', 'Material', 'Stil', 'Länge', 'Breite'];
const AI_TONES = ['SEO-Optimiert 🚀', 'Locker & Cool 😎', 'Freundlich 😊', 'Witzig & Frech 😂'];

// Estimated fees in percent
const PLATFORM_FEES: Record<string, number> = {
    amazon: 15,
    ebay: 11,
    etsy: 6.5,
    tiktok: 5,
    instagram: 5,
    facebook: 5,
    shopify: 2, // Payment processing mostly
    woocommerce: 0,
    bol: 12,
    shopware: 0,
    magento: 0,
    prestashop: 0,
    oxid: 0,
    x: 0
};

// Added mappingKeys to simulate platform specific variables
const AVAILABLE_CHANNELS = [
    {
        id: 'shopify',
        label: 'Shopify',
        sub: 'Global',
        icon: ShoppingBag,
        color: 'text-green-600',
        bg: 'bg-green-50 dark:bg-green-900/20',
        mappingKeys: ['title', 'body_html', 'images', 'variants', 'product_type', 'tags', 'weight', 'sku', 'inventory_policy']
    },
    {
        id: 'woocommerce',
        label: 'WooCommerce',
        sub: 'Global',
        icon: Store,
        color: 'text-purple-600',
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        mappingKeys: ['name', 'description', 'images', 'regular_price', 'manage_stock', 'categories', 'attributes', 'weight', 'dimensions']
    },
    {
        id: 'tiktok',
        label: 'TikTok Shop',
        sub: 'Social Commerce',
        icon: Video,
        color: 'text-slate-900 dark:text-white',
        bg: 'bg-cyan-50 dark:bg-cyan-900/20',
        mappingKeys: ['title', 'description', 'sku', 'stock', 'price', 'video_id', 'size_chart']
    },
    {
        id: 'instagram',
        label: 'Instagram',
        sub: 'Meta Commerce',
        icon: Instagram,
        color: 'text-pink-600',
        bg: 'bg-pink-50 dark:bg-pink-900/20',
        mappingKeys: ['name', 'description', 'image_url', 'price', 'retailer_id', 'url', 'availability']
    },
    {
        id: 'facebook',
        label: 'Facebook Shop',
        sub: 'Meta Commerce',
        icon: Facebook,
        color: 'text-blue-600',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        mappingKeys: ['name', 'message', 'link', 'full_picture', 'price', 'category_specifics']
    },
    {
        id: 'amazon',
        label: 'Amazon EU',
        sub: 'DE, UK, FR, IT, ES',
        icon: ShoppingCart,
        color: 'text-orange-600',
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        mappingKeys: ['ItemName', 'Description', 'MainImageURL', 'OtherImageURL', 'StandardPrice', 'Quantity', 'ItemWeight', 'BulletPoints', 'ASIN']
    },
    {
        id: 'ebay',
        label: 'eBay EU',
        sub: 'DE, UK, FR, IT, ES',
        icon: ShoppingBag,
        color: 'text-blue-600',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        mappingKeys: ['Item.Title', 'Item.Description', 'Item.PictureDetails.PictureURL', 'Item.StartPrice', 'Item.Quantity', 'ItemSpecifics', 'ShippingDetails']
    },
    {
        id: 'x',
        label: 'X Shopping',
        sub: 'Social',
        icon: Twitter,
        color: 'text-slate-900 dark:text-white',
        bg: 'bg-slate-100 dark:bg-slate-800',
        mappingKeys: ['text', 'media_ids', 'product_id', 'card_uri']
    },
    {
        id: 'etsy',
        label: 'Etsy',
        sub: 'Handmade & Vintage',
        icon: Store,
        color: 'text-orange-700',
        bg: 'bg-orange-100 dark:bg-orange-900/20',
        mappingKeys: ['title', 'description', 'images', 'price', 'quantity', 'taxonomy_id', 'who_made', 'when_made', 'tags']
    },
    {
        id: 'shopware',
        label: 'Shopware',
        sub: 'DACH Leader',
        icon: Layers,
        color: 'text-blue-500',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        mappingKeys: ['name', 'description', 'media', 'price', 'stock', 'productNumber', 'active', 'weight', 'manufacturer']
    },
    {
        id: 'magento',
        label: 'Adobe Commerce',
        sub: 'Magento',
        icon: Layers,
        color: 'text-orange-600',
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        mappingKeys: ['name', 'sku', 'price', 'media_gallery_entries', 'stock_item', 'attribute_set_id', 'weight', 'custom_attributes']
    },
    {
        id: 'prestashop',
        label: 'PrestaShop',
        sub: 'Open Source',
        icon: ShoppingCart,
        color: 'text-pink-600',
        bg: 'bg-pink-50 dark:bg-pink-900/20',
        mappingKeys: ['name', 'description', 'id_category_default', 'price', 'reference', 'active', 'associations.images', 'weight']
    },
    {
        id: 'oxid',
        label: 'Oxid eShop',
        sub: 'Enterprise',
        icon: Box,
        color: 'text-green-700',
        bg: 'bg-green-100 dark:bg-green-900/20',
        mappingKeys: ['OXTITLE', 'OXSHORTDESC', 'OXPRICE', 'OXSTOCK', 'OXARTNUM', 'OXWEIGHT', 'OXLENGTH', 'OXWIDTH', 'OXPIC1']
    },
    {
        id: 'bol',
        label: 'Bol.com',
        sub: 'NL, BE',
        icon: Globe,
        color: 'text-blue-800',
        bg: 'bg-blue-100 dark:bg-blue-900/20',
        mappingKeys: ['EAN', 'Title', 'Description', 'Price', 'Stock', 'ReferenceCode', 'Condition', 'Images']
    },
];

// Helper to determine source field based on target key
const getSourceLabel = (targetKey: string): string => {
    const k = targetKey.toLowerCase();
    if (k.includes('title') || k.includes('name') || k === 'handle' || k === 'oxtitle' || k.includes('text')) return 'Titel';
    if (k.includes('price') || k.includes('cost')) return 'Preis';
    if (k.includes('stock') || k.includes('quantity') || k.includes('inventory')) return 'Bestand';
    if (k.includes('description') || k.includes('html') || k.includes('bullet') || k.includes('desc') || k.includes('message')) return 'Beschreibung';
    if (k.includes('sku') || k.includes('ean') || k.includes('number') || k.includes('reference') || k.includes('asin') || k.includes('artnum')) return 'SKU/Code';
    if (k.includes('image') || k.includes('picture') || k.includes('media') || k.includes('pic') || k.includes('url')) return 'Bilder';
    if (k.includes('video')) return 'Video';
    if (k.includes('weight') || k.includes('dim') || k.includes('shipping') || k.includes('length')) return 'Versand';
    if (k.includes('variant') || k.includes('attribute') || k.includes('specifics') || k.includes('param')) return 'Varianten';
    if (k.includes('category') || k.includes('type') || k.includes('taxonomy')) return 'Kategorie';
    if (k.includes('tags')) return 'Tags';
    if (k.includes('active') || k.includes('state') || k.includes('condition') || k.includes('status')) return 'Status';
    return 'Auto-Gen';
};

export const AddProductPage: React.FC<AddProductPageProps> = ({ onSave, onCancel, credits, setCredits }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiTone, setAiTone] = useState(AI_TONES[0]);
    const [loadingChannelId, setLoadingChannelId] = useState<string | null>(null);
    const [autoCalcFees, setAutoCalcFees] = useState(false);
    const [isPriceMonitorActive, setIsPriceMonitorActive] = useState(false);

    // Main form state
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
        tags: '',
        image_url: ''
    });

    const uploadInputRef = React.useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Optimistic update
        const previewUrl = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, image_url: previewUrl }));

        const formDataPayload = new FormData();
        formDataPayload.append('file', file);

        try {
            const uploadedMedia = await mediaService.upload(formDataPayload);
            if (uploadedMedia && uploadedMedia.url) {
                setFormData(prev => ({ ...prev, image_url: uploadedMedia.url }));
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert("Bild-Upload fehlgeschlagen. Bitte erneut versuchen.");
        } finally {
            if (uploadInputRef.current) uploadInputRef.current.value = '';
        }
    };

    // Channel specific pricing state
    const [channelPrices, setChannelPrices] = useState<Record<string, string>>({});

    // Variants state
    const [hasVariants, setHasVariants] = useState(false);
    const [options, setOptions] = useState<VariantOption[]>([]);
    const [generatedVariants, setGeneratedVariants] = useState<GeneratedVariant[]>([]);

    // Configurator state
    const [hasConfigurator, setHasConfigurator] = useState(false);
    const [configGroups, setConfigGroups] = useState<ConfigGroup[]>([]);

    // Effect: Recalculate fees when base price, channels, or toggle changes
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

    const toggleChannel = (channelId: string) => {
        const platform = channelId as Platform;

        if (formData.channels.includes(platform)) {
            // Remove immediately
            setFormData(prev => ({
                ...prev,
                channels: prev.channels.filter(c => c !== platform)
            }));
        } else {
            // Simulate importing variables from the channel
            setLoadingChannelId(channelId);
            setTimeout(() => {
                setFormData(prev => ({
                    ...prev,
                    channels: [...prev.channels, platform]
                }));

                // Initialize price for new channel if needed
                if (autoCalcFees) {
                    const basePrice = parseFloat(formData.price) || 0;
                    const feePercent = PLATFORM_FEES[platform] || 0;
                    const finalPrice = (basePrice + (basePrice * feePercent / 100)).toFixed(2);
                    setChannelPrices(prev => ({ ...prev, [platform]: finalPrice }));
                } else {
                    setChannelPrices(prev => ({ ...prev, [platform]: formData.price }));
                }

                setLoadingChannelId(null);
            }, 600); // 600ms fake loading time
        }
    };

    // --- AI Logic ---
    const handleAIGenerate = () => {
        if (credits < 1) {
            alert("Nicht genügend Credits!");
            return;
        }

        setIsGenerating(true);
        setCredits(prev => prev - 1); // Deduct credit

        // Choose description based on tone to simulate the "Master Prompt" effect
        let simulatedDesc = '';
        if (aiTone.includes('Locker')) {
            simulatedDesc = 'Hey, check diesen Weekender ab! 🎒 Echtleder, sieht mega aus und hält ewig. Perfekt für deinen nächsten City-Trip oder das Gym. Handgefertigt, stylisch und mit genug Platz für all deinen Stuff.';
        } else if (aiTone.includes('Witzig')) {
            simulatedDesc = 'Dieser Weekender ist so schön, dass du ihn wahrscheinlich öfter ausführst als deinen Hund. 🐶 Aus echtem italienischen Leder (riecht gut, schmeckt aber nicht). Kaufen, packen, wegfahren!';
        } else {
            // SEO / Default
            simulatedDesc = 'Dieser handgefertigte Weekender aus italienischem Vollnarbenleder ist der perfekte Begleiter für Ihre Kurztrips. Mit robusten Messingbeschlägen, einem verstellbaren Schultergurt und einem geräumigen Hauptfach bietet er Stil und Funktionalität. \n\nFeatures:\n• 100% Echtes Rindsleder\n• Laptopfach bis 15 Zoll\n• Wasserabweisendes Innenfutter\n• Maße: 55 x 30 x 25 cm';
        }

        // Simulate AI Generation Delay
        setTimeout(() => {
            setFormData({
                ...formData,
                title: 'Premium Vintage Leder Weekender',
                description: simulatedDesc,
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
                shippingProfile: 'dhl_standard',
                category: 'Reisegepäck',
                manufacturer: 'Heritage Goods',
                tags: 'Leder, Reise, Premium, Vintage, Geschenkidee',
                channels: ['shopify', 'amazon', 'tiktok', 'instagram']
            });

            // Also populate generated channel prices
            setChannelPrices({
                shopify: '253.98',
                amazon: '286.35',
                tiktok: '261.45',
                instagram: '261.45'
            });

            setHasVariants(true);
            setOptions([
                { id: 'opt_gen_1', name: 'Farbe', values: ['Cognac', 'Dunkelbraun', 'Schwarz'], currentInput: '' }
            ]);

            // Configurator Extras
            setHasConfigurator(true);
            setConfigGroups([{
                id: 'grp_ai_1',
                name: 'Personalisierung',
                options: [
                    { id: 'opt_ai_1', name: 'Initialen-Gravur (Gold)', priceModifier: '15.00' },
                    { id: 'opt_ai_2', name: 'Geschenkverpackung', priceModifier: '5.90' }
                ]
            }]);

            setIsGenerating(false);
            handleNextStep(); // Auto-advance after generation
        }, 2500);
    };

    // --- Variants Logic ---
    const addOption = () => {
        const newOption: VariantOption = {
            id: `opt_${Date.now()}`,
            name: '',
            values: [],
            currentInput: ''
        };
        setOptions([...options, newOption]);
    };

    const removeOption = (id: string) => {
        setOptions(options.filter(o => o.id !== id));
    };

    const updateOptionName = (id: string, name: string) => {
        setOptions(options.map(o => o.id === id ? { ...o, name } : o));
    };

    const addOptionValue = (id: string, value: string) => {
        if (!value.trim()) return;
        setOptions(options.map(o => {
            if (o.id === id && !o.values.includes(value.trim())) {
                return { ...o, values: [...o.values, value.trim()], currentInput: '' };
            }
            return o;
        }));
    };

    const removeOptionValue = (optionId: string, valueToRemove: string) => {
        setOptions(options.map(o => {
            if (o.id === optionId) {
                return { ...o, values: o.values.filter(v => v !== valueToRemove) };
            }
            return o;
        }));
    };

    useEffect(() => {
        if (hasVariants) {
            generateVariants(options);
        }
    }, [options, hasVariants]);

    const generateVariants = (currentOptions: VariantOption[]) => {
        const validOptions = currentOptions.filter(o => o.values.length > 0);

        if (validOptions.length === 0) {
            if (generatedVariants.length > 0) setGeneratedVariants([]);
            return;
        }

        let combos: { title: string }[] = [];

        if (validOptions.length === 1) {
            combos = validOptions[0].values.map((v: string) => ({ title: v }));
        } else if (validOptions.length >= 2) {
            validOptions[0].values.forEach((v1: string) => {
                validOptions[1].values.forEach((v2: string) => {
                    combos.push({ title: `${v1} / ${v2}` });
                });
            });
            if (validOptions.length >= 3) {
                const newCombos: { title: string }[] = [];
                combos.forEach(c => {
                    const thirdOption = validOptions[2];
                    if (thirdOption) {
                        thirdOption.values.forEach((v3: string) => {
                            newCombos.push({ title: `${c.title} / ${v3}` });
                        });
                    }
                });
                combos = newCombos;
            }
        }

        const newVariants: GeneratedVariant[] = combos.map((c): GeneratedVariant => {
            const existing = generatedVariants.find(gv => gv.title === c.title);
            return existing || {
                id: `var_${Math.random().toString(36).substring(2, 11)}`,
                title: c.title,
                price: formData.price || '',
                comparePrice: formData.comparePrice || '',
                costPerItem: formData.costPerItem || '',
                stock: '0',
                sku: `${formData.sku || 'SKU'}-${c.title.toUpperCase().replace(/[^A-Z0-9]/g, '')}`,
                barcode: '',
                image: ''
            };
        });

        setGeneratedVariants(newVariants);
    };

    const updateVariantField = (id: string, field: keyof GeneratedVariant, value: string) => {
        setGeneratedVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
    };

    const handleVariantImageClick = (id: string, currentImage: string) => {
        if (currentImage) {
            updateVariantField(id, 'image', '');
        } else {
            const randomId = Math.floor(Math.random() * 1000);
            updateVariantField(id, 'image', '');
        }
    };

    // --- Configurator Logic ---
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

    const handleNextStep = () => {
        if (currentStepIndex < WIZARD_STEPS.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrevStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);

        // Prepare channel prices for submission
        const finalChannelPrices: Record<string, number> = {};
        Object.entries(channelPrices).forEach(([key, val]) => {
            finalChannelPrices[key] = parseFloat(String(val)) || 0;
        });

        setTimeout(() => {
            const newProduct: Product = {
                id: `prod_${Date.now()}`,
                title: formData.title || 'Neues Produkt',
                sku: hasVariants ? generatedVariants[0]?.sku || 'VAR-001' : (formData.sku || `SKU-${Math.floor(Math.random() * 1000)}`),
                price: hasVariants ? parseFloat(generatedVariants[0]?.price || '0') : (parseFloat(formData.price) || 0),
                stock: hasVariants ? generatedVariants.reduce((acc, curr) => acc + (parseInt(curr.stock) || 0), 0) : (parseInt(formData.stock) || 0),
                image_url: formData.image_url || (hasVariants && generatedVariants[0]?.image ? generatedVariants[0].image : ''),
                currency: 'EUR',
                channels: formData.channels,
                lastSync: new Date().toISOString(),
                weight: parseFloat(formData.weight) || 0,
                dimensions: {
                    length: parseFloat(formData.length) || 0,
                    width: parseFloat(formData.width) || 0,
                    height: parseFloat(formData.height) || 0
                },
                shippingProfile: formData.shippingProfile,
                category: formData.category
            };
            onSave(newProduct);
        }, 800);
    };

    // Reusable Form Logic for both Modal and List View
    const renderSectionContent = (sectionId: SectionId | string) => {
        switch (sectionId) {
            case 'ai':
                return (
                    <div className="space-y-6">
                        {/* AI Magic Generator Card */}
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 p-6 lg:p-8 rounded-2xl border border-indigo-100/50 dark:border-indigo-800/50 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                            <div className="flex justify-between items-start relative z-10">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 ring-4 ring-white/50 dark:ring-slate-700/50">
                                        <Sparkles size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-1">AI Magic Assistant</h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md">Laden Sie ein Foto hoch. Unser Master-Prompt füllt automatisch alle Felder.</p>
                                    </div>
                                </div>

                                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-900 flex items-center gap-2 shadow-sm">
                                    <Coins size={14} className="text-indigo-500" />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                        Guthaben: <span className="text-indigo-600 dark:text-indigo-400">{credits} Credits</span>
                                    </span>
                                </div>
                            </div>

                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                <div className="border-2 border-dashed border-indigo-200 dark:border-indigo-700/50 rounded-2xl bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 transition-all p-8 flex flex-col items-center justify-center text-center cursor-pointer group h-full min-h-[180px]">
                                    <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-900/20 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 flex items-center justify-center text-indigo-500 mb-3 transition-colors">
                                        <ImageIcon size={24} />
                                    </div>
                                    <p className="font-medium text-slate-900 dark:text-white">Produktbild hier ablegen</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">oder klicken zum Hochladen</p>
                                </div>

                                <div className="flex flex-col h-full justify-between">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 block">Wähle den Schreibstil</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {AI_TONES.map((tone) => (
                                                <button
                                                    key={tone}
                                                    onClick={() => setAiTone(tone)}
                                                    className={`p-3 rounded-xl text-sm font-medium border transition-all text-left flex items-center gap-2 ${aiTone === tone
                                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                                                        }`}
                                                >
                                                    {tone}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 mt-4 md:mt-0">
                                        <p className="text-xs text-indigo-800 dark:text-indigo-300 font-medium flex items-center gap-2 mb-1">
                                            <Zap size={12} fill="currentColor" />
                                            Master-Prompt System aktiv
                                        </p>
                                        <p className="text-[10px] text-indigo-600/80 dark:text-indigo-400/80 leading-relaxed">
                                            Die KI generiert einen optimierten "{aiTone.split(' ')[0]}" Inhalt basierend auf visuellen Merkmalen.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleAIGenerate}
                                disabled={isGenerating || credits < 1}
                                className="w-full mt-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center justify-center gap-3 relative z-10 disabled:opacity-80 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 size={24} className="animate-spin" />
                                        Verarbeite mit Master-Prompt...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 size={24} />
                                        Produkt generieren <span className="bg-white/20 px-2 py-0.5 rounded text-sm ml-1 font-medium">(1 Credit)</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Price Web Analysis Card */}
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 lg:p-8 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/50 shadow-sm relative overflow-hidden">

                            <div className="flex justify-between items-start relative z-10">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 ring-4 ring-white/50 dark:ring-slate-700/50">
                                        <TrendingDown size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-1">Preis-Radar & Smart Repricing</h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg">
                                            Findet automatisch das günstigste Konkurrenzangebot im Web. Auf Wunsch passen wir Ihren Preis dynamisch an.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-3 relative z-10">
                                <div className="bg-white/60 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-800 flex items-center gap-2">
                                    <Clock size={14} className="text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                        Check-Intervall: <span className="font-bold">1 Stunde</span>
                                    </span>
                                </div>
                                <div className="bg-white/60 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-800 flex items-center gap-2">
                                    <Coins size={14} className="text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                        Kosten: <span className="font-bold">5 Credits / Monat</span>
                                    </span>
                                </div>
                            </div>

                            <button
                                className={`w-full mt-6 py-4 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 relative z-10 ${isPriceMonitorActive
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
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">Produkttitel</label>
                            <input
                                type="text"
                                className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-lg text-slate-900 dark:text-white"
                                placeholder="z.B. Moderner Ledersessel"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                autoFocus={true}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">Beschreibung</label>
                            <textarea
                                rows={8}
                                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none text-slate-900 dark:text-white"
                                placeholder="Beschreiben Sie Ihr Produkt..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">Produktstatus</label>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setFormData({ ...formData, status: 'active' })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${formData.status === 'active' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 font-medium' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-white dark:hover:bg-slate-700'}`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${formData.status === 'active' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                    Aktiv
                                </button>
                                <button
                                    onClick={() => setFormData({ ...formData, status: 'draft' })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${formData.status === 'draft' ? 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-white dark:hover:bg-slate-700'}`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${formData.status === 'draft' ? 'bg-slate-500' : 'bg-slate-300'}`}></span>
                                    Entwurf
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'media':
                return (
                    <div className="space-y-8">
                        {/* Images Section */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3 ml-1">Produktbilder</label>

                            <input
                                type="file"
                                ref={uploadInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />

                            <div
                                onClick={() => uploadInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-8 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-800/50 min-h-[160px]"
                            >
                                <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center mb-3 text-slate-400">
                                    <Upload size={24} />
                                </div>
                                <p className="font-medium text-slate-700 dark:text-slate-300">Bilder hochladen</p>
                                <p className="text-xs mt-1">PNG, JPG (max. 5MB)</p>
                            </div>
                            <div className="grid grid-cols-4 gap-4 mt-4">
                                {formData.image_url ? (
                                    <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 relative group">
                                        <img src={formData.image_url} alt="Product" className="w-full h-full object-cover" />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFormData(prev => ({ ...prev, image_url: '' }));
                                            }}
                                            className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 border border-slate-100 dark:border-slate-700"><ImageIcon size={24} /></div>
                                )}
                            </div>
                        </div>

                        {/* Video Section */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <label className="block text-sm font-bold text-slate-900 dark:text-white ml-1">Produktvideos</label>
                                <span className="text-[10px] bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 px-2 py-0.5 rounded-full font-bold">Reels & TikTok</span>
                            </div>

                            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-8 flex flex-col items-center justify-center text-slate-400 hover:border-pink-400 hover:text-pink-500 hover:bg-pink-50/30 dark:hover:bg-pink-900/20 transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-800/50 min-h-[160px]">
                                <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center mb-3 text-slate-400">
                                    <Film size={24} />
                                </div>
                                <p className="font-medium text-slate-700 dark:text-slate-300">Video hochladen</p>
                                <p className="text-xs mt-1">MP4, MOV (9:16 empfohlen)</p>
                            </div>
                            <div className="grid grid-cols-4 gap-4 mt-4">
                                <div className="aspect-[9/16] bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 border border-slate-100 dark:border-slate-700 relative overflow-hidden group">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <PlayCircle size={24} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'pricing':
                const basePrice = parseFloat(formData.price) || 0;
                return (
                    <div className="space-y-6">
                        {hasVariants && (
                            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-2xl text-sm text-indigo-700 dark:text-indigo-300 flex items-start gap-3 border border-indigo-100 dark:border-indigo-800 mb-6">
                                <Info size={16} className="shrink-0 mt-0.5" />
                                <p>Dies sind die Basispreise. Wenn Sie Varianten nutzen, werden diese Preise als Standard übernommen.</p>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">Preis (Netto)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">€</span>
                                    <input
                                        type="number"
                                        className="w-full pl-10 pr-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-slate-900 dark:text-white"
                                        placeholder="0,00"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        autoFocus={true}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">Vergleichspreis (UVP)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">€</span>
                                    <input
                                        type="number"
                                        className="w-full pl-10 pr-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
                                        placeholder="0,00"
                                        value={formData.comparePrice}
                                        onChange={e => setFormData({ ...formData, comparePrice: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">Kosten pro Artikel</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">€</span>
                                    <input
                                        type="number"
                                        className="w-full pl-10 pr-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
                                        placeholder="0,00"
                                        value={formData.costPerItem}
                                        onChange={e => setFormData({ ...formData, costPerItem: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${autoCalcFees ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                        <Calculator size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Gebühren automatisch berechnen</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Schlägt Marktplatz-Gebühren automatisch auf den Preis auf.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setAutoCalcFees(!autoCalcFees)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoCalcFees ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoCalcFees ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            {formData.channels.length > 0 && (
                                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Preis pro Kanal bearbeiten</h5>
                                    {formData.channels.map(channelId => {
                                        const channel = AVAILABLE_CHANNELS.find(c => c.id === channelId);
                                        const feePercent = PLATFORM_FEES[channelId] || 0;
                                        const calculatedFee = (parseFloat(channelPrices[channelId] || '0') - basePrice).toFixed(2);

                                        if (!channel) return null;

                                        return (
                                            <div key={channelId} className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${channel.bg} ${channel.color}`}>
                                                        <channel.icon size={12} />
                                                    </div>
                                                    <span className="font-medium text-sm text-slate-700 dark:text-slate-300">{channel.label}</span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm">
                                                    <div className="flex items-center gap-1 text-slate-400 hidden sm:flex">
                                                        <span className="text-[10px]">Basis + {feePercent}%</span>
                                                        {parseFloat(calculatedFee) > 0 && (
                                                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 rounded">€{calculatedFee}</span>
                                                        )}
                                                    </div>
                                                    <div className="relative">
                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">€</span>
                                                        <input
                                                            type="number"
                                                            className="w-24 pl-5 pr-2 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-900/30 text-right font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm"
                                                            placeholder="0.00"
                                                            value={channelPrices[channelId] || (basePrice > 0 ? basePrice.toFixed(2) : '')}
                                                            onChange={(e) => {
                                                                // Update the specific channel price in state
                                                                setChannelPrices(prev => ({
                                                                    ...prev,
                                                                    [channelId]: e.target.value
                                                                }));
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'variants':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white">Varianten aktivieren</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Für Produkte mit mehreren Optionen (z.B. Größe, Farbe)</p>
                            </div>
                            <button
                                onClick={() => setHasVariants(!hasVariants)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hasVariants ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hasVariants ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        {hasVariants && (
                            <div className="space-y-8 animate-in fade-in">
                                <div className="space-y-4">
                                    {options.map((option, index) => (
                                        <div key={option.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                            <div className="flex items-center justify-between mb-3">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Option {index + 1}</label>
                                                <button onClick={() => removeOption(option.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded-lg">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div>
                                                    <input
                                                        type="text"
                                                        placeholder="Name (z.B. Größe)"
                                                        className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-sm text-slate-900 dark:text-white"
                                                        value={option.name}
                                                        onChange={(e) => updateOptionName(option.id, e.target.value)}
                                                    />
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {OPTION_PRESETS.map(preset => (
                                                            <button
                                                                key={preset}
                                                                type="button"
                                                                onClick={() => updateOptionName(option.id, preset)}
                                                                className={`px-2 py-1 rounded-lg text-xs border transition-colors ${option.name === preset ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                                            >
                                                                {preset}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex flex-wrap gap-2 items-center p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl min-h-[42px]">
                                                        {option.values.map(val => (
                                                            <span key={val} className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                                                                {val}
                                                                <button onClick={() => removeOptionValue(option.id, val)} className="hover:text-indigo-900 dark:hover:text-indigo-100"><Trash2 size={10} /></button>
                                                            </span>
                                                        ))}
                                                        <input
                                                            type="text"
                                                            placeholder={option.values.length === 0 ? "Werte eingeben... Enter" : ""}
                                                            className="flex-1 bg-transparent border-none focus:outline-none text-sm min-w-[100px] text-slate-900 dark:text-white"
                                                            value={option.currentInput}
                                                            onChange={(e) => {
                                                                const newOptions = options.map(o => o.id === option.id ? { ...o, currentInput: e.target.value } : o);
                                                                setOptions(newOptions);
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    addOptionValue(option.id, option.currentInput);
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {options.length < 3 && (
                                        <button
                                            onClick={addOption}
                                            className="w-full py-3 border border-dashed border-indigo-200 dark:border-indigo-800 rounded-xl text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Plus size={16} />
                                            Option hinzufügen
                                        </button>
                                    )}
                                </div>

                                {generatedVariants.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Vorschau ({generatedVariants.length})</h4>
                                        <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                                                    <tr>
                                                        <th className="px-4 py-3">Variante</th>
                                                        <th className="px-4 py-3">Preis</th>
                                                        <th className="px-4 py-3">Anzahl</th>
                                                        <th className="px-4 py-3">SKU</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                    {generatedVariants.map((variant) => (
                                                        <tr key={variant.id} className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800">
                                                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{variant.title}</td>
                                                            <td className="px-4 py-3">
                                                                <input
                                                                    type="text"
                                                                    className="w-20 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                                                                    value={variant.price}
                                                                    onChange={(e) => updateVariantField(variant.id, 'price', e.target.value)}
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <input
                                                                    type="number"
                                                                    className="w-16 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                                                                    value={variant.stock}
                                                                    onChange={(e) => updateVariantField(variant.id, 'stock', e.target.value)}
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <input
                                                                    type="text"
                                                                    className="w-24 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                                                                    value={variant.sku}
                                                                    onChange={(e) => updateVariantField(variant.id, 'sku', e.target.value)}
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            case 'shipping':
                return (
                    <div className="space-y-6">
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
                                    className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white appearance-none"
                                    value={formData.shippingProfile}
                                    onChange={(e) => setFormData({ ...formData, shippingProfile: e.target.value })}
                                >
                                    <option value="standard">Standard Versand (DHL Paket)</option>
                                    <option value="express">Express Versand</option>
                                    <option value="bulky">Sperrgut / Spedition</option>
                                    <option value="letter">Warensendung / Brief</option>
                                    <option value="digital">Digitales Produkt (Kein Versand)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">Gewicht</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Scale size={16} /></span>
                                    <input
                                        type="number"
                                        className="w-full pl-10 pr-12 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
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
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white"
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
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white"
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
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white"
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
            case 'configurator':
                return (
                    <div className="space-y-6">
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
                            <div className="space-y-6 animate-in fade-in">
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
                                                            className="w-full pl-5 pr-6 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-right text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
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
            case 'inventory':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">SKU</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Tag size={16} /></span>
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
                                        placeholder="FURN-001"
                                        value={formData.sku}
                                        onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">Barcode</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Barcode size={16} /></span>
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
                                        placeholder="0123456789"
                                        value={formData.barcode}
                                        onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">Lagerbestand</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Box size={16} /></span>
                                    <input
                                        type="number"
                                        className="w-full pl-10 pr-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
                                        placeholder="0"
                                        value={formData.stock}
                                        onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'organization':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">Kategorie</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white appearance-none"
                                >
                                    <option>Möbel</option>
                                    <option>Elektronik</option>
                                    <option>Zubehör</option>
                                    <option>Kleidung</option>
                                    <option>Reisegepäck</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">Hersteller</label>
                                <input
                                    type="text"
                                    className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
                                    placeholder="z.B. Acme Corp"
                                    value={formData.manufacturer}
                                    onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">Tags</label>
                                <input
                                    type="text"
                                    className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
                                    placeholder="z.B. Vintage, Sommer, Sale"
                                    value={formData.tags}
                                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                );
            case 'organization_channels':
                return (
                    <div className="space-y-6">
                        <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Aktive Vertriebskanäle</label>
                                {formData.channels.length > 0 && (
                                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full flex items-center gap-1">
                                        <Database size={10} />
                                        {formData.channels.length} Verbunden
                                    </span>
                                )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                {AVAILABLE_CHANNELS.map(channel => {
                                    const isLoading = loadingChannelId === channel.id;
                                    const isSelected = formData.channels.includes(channel.id as Platform);
                                    return (
                                        <label
                                            key={channel.id}
                                            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-300 relative overflow-hidden ${isSelected
                                                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 ring-1 ring-indigo-500/20 shadow-sm'
                                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            {isLoading && (
                                                <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10 flex items-center justify-center">
                                                    <Loader2 size={18} className="animate-spin text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                            )}
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleChannel(channel.id)}
                                                className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${channel.bg} ${channel.color}`}>
                                                        <channel.icon size={12} />
                                                    </div>
                                                    <span className={`font-bold text-sm ${isSelected ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-700 dark:text-slate-300'}`}>
                                                        {channel.label}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight pl-8">
                                                    {channel.sub}
                                                </p>
                                                {isSelected && (
                                                    <div className="mt-2 pl-8 flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-medium animate-in fade-in slide-in-from-top-1">
                                                        <ArrowRightLeft size={10} />
                                                        <span>Variablen gemappt</span>
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Smart Mapping Visualization */}
                        {formData.channels.length > 0 && (
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 md:p-5 border border-slate-200 dark:border-slate-700 mt-2">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm text-indigo-600 dark:text-indigo-400">
                                        <Zap size={16} fill="currentColor" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">Intelligentes Variablen-Mapping</h4>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400">ShopMarkets befüllt automatisch die erforderlichen Felder für jeden Kanal.</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {formData.channels.map(channelId => {
                                        const channel = AVAILABLE_CHANNELS.find(c => c.id === channelId);
                                        if (!channel) return null;
                                        return (
                                            <div key={channelId} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl p-3 shadow-sm flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                                                <div className="flex items-center gap-2 min-w-[120px]">
                                                    <div className={`w-2 h-2 rounded-full ${channel.color.replace('text', 'bg')}`}></div>
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{channel.label}</span>
                                                </div>

                                                <div className="flex-1 flex flex-wrap gap-2">
                                                    {channel.mappingKeys?.map(key => {
                                                        const sourceLabel = getSourceLabel(key);
                                                        return (
                                                            <div key={key} className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-700 group hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors cursor-help" title={`Quelle: ${sourceLabel}`}>
                                                                <span className="text-[10px] text-indigo-400 font-bold">{sourceLabel}</span>
                                                                <ArrowRightLeft size={8} className="text-slate-300 dark:text-slate-600" />
                                                                <span className="text-[10px] font-mono font-medium text-slate-600 dark:text-slate-400">{key}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in duration-300 pb-24 md:pb-10">

            {/* Wizard Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={onCancel}
                        className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold font-serif-display text-slate-900 dark:text-white">Neues Produkt</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Schritt {currentStepIndex + 1} von {WIZARD_STEPS.length}: {WIZARD_STEPS[currentStepIndex].label}</p>
                    </div>
                </div>

                {/* Stepper */}
                <div className="relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -z-10 hidden md:block" />
                    <div className="flex justify-between overflow-x-auto md:overflow-visible pb-4 md:pb-0 gap-4 md:gap-0 scrollbar-hide">
                        {WIZARD_STEPS.map((step, idx) => {
                            const isActive = idx === currentStepIndex;
                            const isCompleted = idx < currentStepIndex;
                            const Icon = step.icon;

                            return (
                                <button
                                    key={step.id}
                                    onClick={() => {
                                        if (isCompleted) {
                                            setCurrentStepIndex(idx);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }
                                    }}
                                    disabled={!isCompleted && !isActive}
                                    className={`flex flex-col items-center gap-2 group min-w-[80px] md:min-w-0 ${!isCompleted && !isActive ? 'cursor-not-allowed opacity-50 grayscale' : 'cursor-pointer'}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all relative z-10 ${isActive
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-110'
                                        : isCompleted
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400'
                                        }`}>
                                        {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                                    </div>
                                    <span className={`text-xs font-bold whitespace-nowrap ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {step.label}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 lg:p-10 shadow-sm border border-slate-100 dark:border-slate-800 min-h-[400px]">
                {renderSectionContent(WIZARD_STEPS[currentStepIndex].id)}
            </div>

            {/* Sticky Navigation Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 p-4 lg:p-6 z-50">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <button
                        onClick={handlePrevStep}
                        disabled={currentStepIndex === 0}
                        className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <ChevronLeft size={18} />
                        <span className="hidden sm:inline">Zurück</span>
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="px-6 py-3 rounded-xl font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors hidden sm:block"
                        >
                            Abbrechen
                        </button>

                        {currentStepIndex === WIZARD_STEPS.length - 1 ? (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-70"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                Speichern
                            </button>
                        ) : (
                            <button
                                onClick={handleNextStep}
                                className="px-8 py-3 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white font-bold hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all shadow-lg flex items-center gap-2"
                            >
                                {currentStepIndex === 0 && !formData.title ? 'Überspringen' : 'Weiter'}
                                <ChevronRight size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};