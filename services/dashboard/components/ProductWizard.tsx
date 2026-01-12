import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductWizardStore } from '../store/productWizardStore';
import { ProductTypeSelector } from './ProductWizard/ProductTypeSelector';
import { AIGenerator } from './ProductWizard/AIGenerator';
import { GeneralInfo } from './ProductWizard/GeneralInfo';
import { AttributesVariants } from './ProductWizard/AttributesVariants';
import { Configurator } from './ProductWizard/Configurator';
import { MediaUpload } from './ProductWizard/MediaUpload';
import { StepPricing } from './ProductWizard/StepPricing';
import { Organization } from './ProductWizard/Organization';
import { SEOMarketing } from './ProductWizard/SEOMarketing';
import { PreviewSave } from './ProductWizard/PreviewSave';
import { ChannelsSync } from './ProductWizard/ChannelsSync';

import {
    Sparkles, Layers, ImageIcon, DollarSign, ShieldCheck, X, ChevronRight, Check, Loader2, Globe, SlidersHorizontal, Wrench, Tag
} from 'lucide-react';

// NEW: 7-Step Structure based on PRODUCT-CREATION-FLOW.md
// Versioning for easy check
const WIZARD_VERSION = 'W 0.04';

interface WizardStepFn {
    id: string;
    label: string;
    icon: any;
    component: React.FC<any>;
    show: (t: string) => boolean;
}

const ALL_WIZARD_STEPS: WizardStepFn[] = [
    { id: 'type', label: 'Produktart', icon: Layers, component: ProductTypeSelector, show: () => true },
    { id: 'ai', label: 'AI-Generator', icon: Sparkles, component: AIGenerator, show: () => true },
    { id: 'basis', label: 'Basis', icon: Layers, component: GeneralInfo, show: () => true },
    { id: 'attributes', label: 'Attribute', icon: SlidersHorizontal, component: AttributesVariants, show: (t) => !['virtual', 'downloadable', 'service'].includes(t) },
    { id: 'configurator', label: 'Konfigurator', icon: Wrench, component: Configurator, show: (t) => ['personalized', 'configurable', 'simple'].includes(t) },
    { id: 'media', label: 'Medien', icon: ImageIcon, component: MediaUpload, show: () => true },
    { id: 'pricing', label: 'Preise & Lager', icon: DollarSign, component: StepPricing, show: () => true },
    { id: 'org', label: 'Organisation', icon: Tag, component: Organization, show: () => true },
    { id: 'seo', label: 'SEO & Sichtbarkeit', icon: Globe, component: SEOMarketing, show: () => true },
    { id: 'save', label: 'Speichern', icon: ShieldCheck, component: PreviewSave, show: () => true },
    { id: 'sync', label: 'Channel Sync', icon: Globe, component: ChannelsSync, show: () => true },
];

export const ProductWizard: React.FC = () => {
    const navigate = useNavigate();
    const { currentStep, setCurrentStep, stepData, reset, productType, isAIUsed } = useProductWizardStore();
    const navRef = useRef<HTMLDivElement>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isProductSaved, setIsProductSaved] = useState(false);

    // Filter Steps dynamically
    const visibleSteps = ALL_WIZARD_STEPS.filter(step => step.show(productType || 'simple'));

    // Map 1-based index to Array Index
    const currentStepIndex = currentStep - 1;

    // Ensure step is within bounds
    useEffect(() => {
        if (currentStep < 1) setCurrentStep(1);
        if (currentStep > visibleSteps.length) setCurrentStep(visibleSteps.length);
    }, [currentStep, setCurrentStep, visibleSteps.length]);

    const handleNextStep = () => {
        if (currentStep < visibleSteps.length) {
            // Check if current step is "Save" step
            const saveStepIndex = visibleSteps.findIndex(s => s.id === 'save');

            // Prevent going past Save if not saved
            if (saveStepIndex !== -1 && currentStepIndex === saveStepIndex && !isProductSaved) {
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
        // Note: Components write to FIXED Store Keys (e.g. 2 for General, 3 for Media) regardless of UI Step Index.
        const payload = {
            product_type: productType || 'simple',
            is_ai_generated: isAIUsed,
            title: stepData[2]?.title || 'Neues Produkt',
            description: stepData[2]?.description || '',
            short_description: stepData[2]?.shortDescription || '',
            images: stepData[3]?.images || [],
            video: stepData[3]?.video || null,
            attributes: stepData[4]?.attributes || {},
            variants: stepData[4]?.variants || [],
            price_radar: stepData[5],
            price: stepData[6]?.price,
            sku: stepData[7]?.sku,
            barcode: stepData[7]?.barcode,
            stock: stepData[7]?.quantity,
            track_quantity: stepData[7]?.trackQuantity,
            low_stock_threshold: stepData[7]?.lowStockThreshold,
            shipping: stepData[8],
            seo: stepData[9]?.seo,
            tiktok: stepData[9]?.tiktok, // From MediaUpload or SEOMarketing (Key 9)
            category: stepData[10]?.category,
            vendor: stepData[10]?.vendor,
            tags: stepData[10]?.tags,
            extras: stepData[11],
            channels: stepData[12]?.channels || []
        };

        if (!payload.title || payload.title === 'Neues Produkt') { alert('Titel fehlt'); setIsSaving(false); return; }
        if (!payload.price) { alert('Preis fehlt'); setIsSaving(false); return; }
        if (!payload.sku) { alert('SKU fehlt'); setIsSaving(false); return; }
        if (payload.stock === undefined) { alert('Bestand fehlt'); setIsSaving(false); return; }
        if (!payload.images || payload.images.length === 0) { alert('Bilder fehlen'); setIsSaving(false); return; }

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
                // Proceed to next step (Should be Sync)
                setCurrentStep(currentStep + 1);
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

    const CurrentComponent = visibleSteps[currentStepIndex]?.component || (() => <div>Step not found</div>);
    const saveStepIndex = visibleSteps.findIndex(s => s.id === 'save');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <div className="relative w-full max-w-7xl bg-white dark:bg-[#0F172A] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[90vh] border border-gray-200 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/5 transition-colors duration-300">

                {/* Header */}
                <div className="px-8 py-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 z-20 flex flex-col gap-6 transition-colors duration-300">
                    <div className="flex justify-between items-start w-full">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Neues Produkt</h2>
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-500 border border-slate-200 dark:border-slate-700">
                                    {WIZARD_VERSION}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Schritt {currentStep} von {visibleSteps.length} ({visibleSteps[currentStepIndex]?.label})</p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors border border-gray-200 dark:border-slate-700 group"
                        >
                            <X size={20} className="text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                        </button>
                    </div>

                    {/* Navigation Pills */}
                    <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-2" ref={navRef}>
                        {visibleSteps.map((step, idx) => {
                            const isActive = currentStepIndex === idx;
                            const isCompleted = idx < currentStepIndex;
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
                                    onClick={() => { if (idx < saveStepIndex + 1 || isProductSaved) setCurrentStep(idx + 1) }}
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

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-[#0B0F19] relative transition-colors duration-300">
                    <div className="max-w-5xl mx-auto p-8 lg:p-12">
                        <CurrentComponent />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-5 border-t border-gray-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex justify-between items-center z-20 transition-colors duration-300">
                    <button
                        onClick={handlePrevStep}
                        disabled={currentStepIndex === 0 || isSaving}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight className="rotate-180" size={18} /> Zurück
                    </button>

                    <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-400 hidden sm:inline-block">
                            {isProductSaved ? 'Gespeichert' : 'Änderungen werden geprüft'}
                        </span>

                        <button
                            onClick={currentStepIndex === saveStepIndex ? handleSaveProduct : handleNextStep}
                            disabled={isSaving}
                            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-70 disabled:transform-none"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={20} /> : null}
                            <span>{currentStepIndex === saveStepIndex ? 'Produkt Speichern' : currentStepIndex === visibleSteps.length - 1 ? 'Fertigstellen' : 'Weiter'}</span>
                            {!isSaving && <ChevronRight size={18} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
