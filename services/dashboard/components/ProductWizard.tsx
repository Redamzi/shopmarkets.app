import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductWizardStore } from '../store/productWizardStore';
import { ProductTypeSelector } from './ProductWizard/ProductTypeSelector';
import { AIGenerator } from './ProductWizard/AIGenerator';
import { MediaUpload } from './ProductWizard/MediaUpload';
import { AttributesVariants } from './ProductWizard/AttributesVariants';
import { PriceRadar } from './ProductWizard/PriceRadar';
import { PricingInventory } from './ProductWizard/PricingInventory';
import { SEOMarketing } from './ProductWizard/SEOMarketing';
import { ChannelsSync } from './ProductWizard/ChannelsSync';
import { SEOPreview } from './ProductWizard/SEOPreview';
import { ReadyCheck } from './ProductWizard/ReadyCheck';
import { PreviewSave } from './ProductWizard/PreviewSave';

// Import Icons
import {
    Sparkles, Layers, ImageIcon, SlidersHorizontal, TrendingDown, DollarSign,
    Box, Truck, Video, Tag, Wrench, Globe, ShieldCheck, X, ChevronRight, Check, Loader2
} from 'lucide-react';

const WIZARD_STEPS = [
    { id: 'ai', label: 'AI Start', icon: Sparkles, component: AIGenerator },
    { id: 'general', label: 'Basis', icon: Layers, component: ProductTypeSelector }, // Step 1 is mapped to Type Selector for now
    { id: 'media', label: 'Medien', icon: ImageIcon, component: MediaUpload },
    { id: 'variants', label: 'Varianten', icon: SlidersHorizontal, component: AttributesVariants },
    { id: 'price_check', label: 'Preis Radar', icon: TrendingDown, component: PriceRadar },
    { id: 'pricing', label: 'Preise', icon: DollarSign, component: PricingInventory },
    { id: 'inventory', label: 'Lager', icon: Box, component: () => <div className="p-10 text-center">Lager Verwaltung (Teil von Preise)</div> },
    { id: 'shipping', label: 'Versand', icon: Truck, component: () => <div className="p-10 text-center">Versand Feature (Coming Soon)</div> },
    { id: 'tiktok', label: 'TikTok', icon: Video, component: SEOMarketing }, // TikTok included here
    { id: 'organization', label: 'Org', icon: Tag, component: () => <div className="p-10 text-center">Organisation (Coming Soon)</div> },
    { id: 'configurator', label: 'Extras', icon: Wrench, component: () => <div className="p-10 text-center">Extras (Coming Soon)</div> },
    { id: 'organization_channels', label: 'Kanäle', icon: Globe, component: ChannelsSync },
    { id: 'check', label: 'Prüfung', icon: ShieldCheck, component: PreviewSave },
];

export const ProductWizard: React.FC = () => {
    const navigate = useNavigate();
    const { currentStep, setCurrentStep } = useProductWizardStore();
    const navRef = useRef<HTMLDivElement>(null);

    // Map 1-based index (currentStep) to 0-based index for array access
    const currentStepIndex = currentStep - 1;

    // Ensure step is within bounds
    useEffect(() => {
        if (currentStep < 1) setCurrentStep(1);
        if (currentStep > WIZARD_STEPS.length) setCurrentStep(WIZARD_STEPS.length);
    }, [currentStep, setCurrentStep]);

    const handleNextStep = () => {
        if (currentStep < WIZARD_STEPS.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleClose = () => {
        navigate('/products');
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-gray-100">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={handleClose} />

            <div className="relative w-full max-w-6xl bg-white dark:bg-slate-950 rounded-none md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-full md:h-[95vh] border-0 md:border border-white/20">

                {/* Header with Navigation */}
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl z-20 flex flex-col gap-4">
                    <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-4">
                            <button onClick={handleClose} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <X size={20} className="text-slate-600 dark:text-slate-300" />
                            </button>
                            <div>
                                <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Neues Produkt</h2>
                                <p className="text-xs text-slate-500 font-medium">
                                    Schritt {currentStep} von {WIZARD_STEPS.length}
                                </p>
                            </div>
                        </div>
                        <div className="text-right text-xs text-gray-400">
                            v2.0 New Design
                        </div>
                    </div>

                    {/* Desktop Navigation Bar */}
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1" ref={navRef}>
                        {WIZARD_STEPS.map((step, idx) => {
                            const isActive = currentStepIndex === idx;
                            const isCompleted = idx < currentStepIndex;

                            return (
                                <button
                                    key={step.id}
                                    onClick={() => setCurrentStep(idx + 1)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium whitespace-nowrap border ${isActive
                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 shadow-sm'
                                        : isCompleted
                                            ? 'text-indigo-600/70 border-transparent hover:bg-gray-50'
                                            : 'bg-transparent border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                                        }`}
                                >
                                    {React.createElement(step.icon, { size: 16, className: isActive || isCompleted ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400' })}
                                    {step.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#f8f9fc] dark:bg-[#0b0f19] relative">
                    <div className="max-w-4xl mx-auto p-8">
                        {/* Mobile Stepper Header */}
                        <div className="md:hidden mb-6 flex items-center justify-between text-indigo-600 dark:text-indigo-400">
                            <div className="flex items-center gap-3">
                                {React.createElement(WIZARD_STEPS[currentStepIndex].icon, { size: 24 })}
                                <h3 className="text-xl font-bold font-serif-display text-slate-900 dark:text-white">{WIZARD_STEPS[currentStepIndex].label}</h3>
                            </div>
                            <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${((currentStepIndex + 1) / WIZARD_STEPS.length) * 100}%` }}></div>
                            </div>
                        </div>

                        {/* Render Active Component */}
                        <div className="animate-in fade-in duration-300 slide-in-from-bottom-4">
                            <CurrentComponent />
                        </div>
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

                    <button
                        onClick={handleNextStep}
                        className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:scale-105 shadow-lg flex items-center gap-2 transition-all"
                    >
                        {currentStepIndex === WIZARD_STEPS.length - 1 ? (
                            <>
                                <Check size={18} /> Speichern & Fertig
                            </>
                        ) : (
                            <>
                                Weiter <ChevronRight size={18} />
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};
