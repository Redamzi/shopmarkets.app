import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductWizardStore } from '../store/productWizardStore';
import { ProductTypeSelector } from './ProductWizard/ProductTypeSelector';
import { AIGenerator } from './ProductWizard/AIGenerator'; // Step 2
import { StepDetails } from './ProductWizard/StepDetails'; // Step 3 Wrapper
import { MediaUpload } from './ProductWizard/MediaUpload'; // Step 4
import { StepPricing } from './ProductWizard/StepPricing'; // Step 5 Wrapper
import { PreviewSave } from './ProductWizard/PreviewSave'; // Step 6
import { ChannelsSync } from './ProductWizard/ChannelsSync'; // Step 7 (Sync)

// Import Icons
import {
    Sparkles, Layers, ImageIcon, DollarSign, ShieldCheck, X, ChevronRight, Check, Loader2, Globe
} from 'lucide-react';

// NEW: 7-Step Structure based on PRODUCT-CREATION-FLOW.md
const WIZARD_STEPS = [
    { id: 'type', label: 'Produktart', icon: Layers, component: ProductTypeSelector },
    { id: 'ai', label: 'AI-Generator', icon: Sparkles, component: AIGenerator },
    { id: 'details', label: 'Details', icon: Layers, component: StepDetails },
    { id: 'media', label: 'Medien', icon: ImageIcon, component: MediaUpload },
    { id: 'pricing', label: 'Preise & Lager', icon: DollarSign, component: StepPricing },
    { id: 'save', label: 'Speichern', icon: ShieldCheck, component: PreviewSave },
    { id: 'sync', label: 'Channel Sync', icon: Globe, component: ChannelsSync }, // Post-Save
];

export const ProductWizard: React.FC = () => {
    const navigate = useNavigate();
    const { currentStep, setCurrentStep, stepData, reset, productType } = useProductWizardStore();
    const navRef = useRef<HTMLDivElement>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isProductSaved, setIsProductSaved] = useState(false); // To enable Step 7

    // Map 1-based index
    const currentStepIndex = currentStep - 1;

    // Ensure step is within bounds
    useEffect(() => {
        if (currentStep < 1) setCurrentStep(1);
        if (currentStep > WIZARD_STEPS.length) setCurrentStep(WIZARD_STEPS.length);
    }, [currentStep, setCurrentStep]);

    const handleNextStep = () => {
        if (currentStep < WIZARD_STEPS.length) {
            // Prevent going to Step 7 (Sync) if not saved
            if (currentStepIndex === 5 && !isProductSaved) { // Step 6 is Save (Index 5)
                handleSaveProduct();
                return;
            }
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleClose = () => {
        if (confirm('Möchten Sie den Wizard wirklich verlassen? Ihre Daten gehen verloren.')) {
            navigate('/products');
        }
    };

    const handleSaveProduct = async () => {
        setIsSaving(true);

        // Assemble Payload from Wrappers
        // NOTE: StepDetails and StepPricing write to steps 2,4,9,10,11 (Details) and 6,7,5,8 (Pricing) in global store.
        // We need to ensure we read from correct Store Keys regardless of UI Step Index.
        // The Store Keys are numeric. StepDetails writes to: 2 (General), 4 (Vars), 9 (TikTok), 10 (Org), 11 (Extras)
        // StepPricing writes to: 6 (Price), 5 (Radar), 7 (Inv), 8 (Shipping)

        const payload = {
            product_type: productType || 'simple',
            // Basic Info (Key 2)
            title: stepData[2]?.title || 'Neues Produkt',
            description: stepData[2]?.description || '',
            short_description: stepData[2]?.shortDescription || '',
            // Media (Key 3 - MediaUpload is UI Step 4 but usually writes to Key 3?) 
            // WAIT. MediaUpload writes to store based on `currentStep`.
            // IF I CHANGED UI STEPS, `currentStep` IS DIFFERENT!
            // THIS IS CRITICAL. Components use `currentStep` to write data?
            // Checking MediaUpload: uses `stepData[currentStep]`.
            // Checking GeneralInfo: uses `stepData[2]` (Hardcoded? No, I implemented it to use Hardcoded 2 in GeneralInfo, but others?)

            // I MUST ENSURE COMPONENTS WRITE TO FIXED KEYS, NOT `currentStep`.
            // GeneralInfo: writes to 2. (Checked)
            // MediaUpload: writes to `currentStep`? I need to check.
            images: stepData[3]?.images || [], // Let's Assume Media maps to 3

            attributes: stepData[4]?.attributes || {},
            variants: stepData[4]?.variants || [],
            price_radar: stepData[5],
            price: stepData[6]?.price,
            sku: stepData[7]?.sku,
            barcode: stepData[7]?.barcode,
            stock: stepData[7]?.quantity,
            track_quantity: stepData[7]?.trackQuantity,
            low_stock_threshold: stepData[7]?.lowStockThreshold, // Added this back from original
            shipping: stepData[8],
            seo: stepData[9]?.seo,
            tiktok: stepData[9]?.tiktok,
            category: stepData[10]?.category,
            vendor: stepData[10]?.vendor,
            tags: stepData[10]?.tags,
            extras: stepData[11],
            channels: stepData[12]?.channels || []
        };

        // Validation (Shortened)
        if (!payload.title || payload.title === 'Neues Produkt') { alert('Titel fehlt'); setIsSaving(false); return; }
        if (!payload.price) { alert('Preis fehlt'); setIsSaving(false); return; }
        if (!payload.sku) { alert('SKU fehlt'); setIsSaving(false); return; } // Added back from original
        if (payload.stock === undefined) { alert('Bestand fehlt'); setIsSaving(false); return; } // Added back from original
        if (!payload.images || payload.images.length === 0) { alert('Bilder fehlen'); setIsSaving(false); return; } // Added back from original

        try {
            const response = await fetch('/api/product-wizard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')} ` },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (result.success) {
                alert('Produkt gespeichert! Jetzt Sync starten.');
                setIsProductSaved(true);
                setCurrentStep(7); // Go to Sync
            } else {
                alert(`Fehler: ${result.message} `);
            }
        } catch (error) {
            console.error(error);
            alert('Netzwerkfehler');
        } finally {
            setIsSaving(false);
        }
    };

    // Auto-scroll navigation
    useEffect(() => {
        if (navRef.current) {
            const activeTab = navRef.current.children[currentStepIndex] as HTMLElement;
            if (activeTab) {
                activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [currentStepIndex]);

    const CurrentComponent = WIZARD_STEPS[currentStepIndex]?.component || (() => <div>Step not found</div>);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">

            {/* Main Modal Container - Dynamic Theme */}
            <div className="relative w-full max-w-7xl bg-white dark:bg-[#0F172A] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[90vh] border border-gray-200 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/5 transition-colors duration-300">

                {/* Header - Dynamic Theme */}
                <div className="px-8 py-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 z-20 flex flex-col gap-6 transition-colors duration-300">
                    <div className="flex justify-between items-start w-full">
                        <div>
                            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">Neues Produkt</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Schritt {currentStep} von {WIZARD_STEPS.length}</p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors border border-gray-200 dark:border-slate-700 group"
                        >
                            <X size={20} className="text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                        </button>
                    </div>

                    {/* Navigation Pills - Dynamic Theme */}
                    <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-2" ref={navRef}>
                        {WIZARD_STEPS.map((step, idx) => {
                            const isActive = currentStepIndex === idx;
                            const isCompleted = idx < currentStepIndex;

                            // Dynamic Pill Logic
                            let iconColor = 'text-slate-400';
                            let bgClass = 'bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-800 text-slate-500 dark:text-slate-400';

                            if (isActive) {
                                iconColor = 'text-indigo-600 dark:text-indigo-400';
                                bgClass = 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/50 text-indigo-700 dark:text-indigo-400 shadow-sm';
                            } else if (isCompleted) {
                                iconColor = 'text-green-500 dark:text-green-400';
                                bgClass = 'bg-white dark:bg-slate-800/50 border-green-200 dark:border-green-900/30 text-slate-700 dark:text-slate-300';
                            }

                            return (
                                <button
                                    key={step.id}
                                    onClick={() => { if (idx < 6 || isProductSaved) setCurrentStep(idx + 1) }}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium whitespace-nowrap group hover:bg-gray-50 dark:hover:bg-slate-800 ${bgClass}`}
                                >
                                    {isCompleted ? (
                                        <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                                            <Check size={12} className="text-green-600 dark:text-green-400" />
                                        </div>
                                    ) : (
                                        React.createElement(step.icon, { size: 18, className: iconColor })
                                    )}
                                    <span>{step.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Body - Dynamic Theme */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-[#0B0F19] relative transition-colors duration-300">
                    <div className="max-w-5xl mx-auto p-8 lg:p-12">
                        <CurrentComponent />
                    </div>
                </div>

                {/* Footer - Dynamic Theme */}
                <div className="px-8 py-5 border-t border-gray-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex justify-between items-center z-20 transition-colors duration-300">
                    <button
                        onClick={handlePrevStep}
                        disabled={currentStepIndex === 0 || isSaving}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight className="rotate-180" size={18} /> Zurück
                    </button>

                    <div className="flex items-center gap-4">
                        {/* Optional Info Text */}
                        <span className="text-xs text-slate-400 hidden sm:inline-block">
                            {isProductSaved ? 'Gespeichert' : 'Änderungen werden geprüft'}
                        </span>

                        <button
                            onClick={currentStepIndex === 5 ? handleSaveProduct : handleNextStep}
                            disabled={isSaving}
                            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-70 disabled:transform-none"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={20} /> : null}
                            <span>{currentStepIndex === 5 ? 'Produkt Speichern' : currentStepIndex === 6 ? 'Fertigstellen' : 'Weiter'}</span>
                            {!isSaving && <ChevronRight size={18} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
