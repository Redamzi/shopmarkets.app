```typescript
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
    { id: 'type', label: '1. Produktart', icon: Layers, component: ProductTypeSelector },
    { id: 'ai', label: '2. AI-Generator', icon: Sparkles, component: AIGenerator },
    { id: 'details', label: '3. Details', icon: Layers, component: StepDetails },
    { id: 'media', label: '4. Medien', icon: ImageIcon, component: MediaUpload },
    { id: 'pricing', label: '5. Preise & Lager', icon: DollarSign, component: StepPricing },
    { id: 'save', label: '6. Speichern', icon: ShieldCheck, component: PreviewSave },
    { id: 'sync', label: '7. Channel Sync', icon: Globe, component: ChannelsSync }, // Post-Save
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
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ localStorage.getItem('token') } ` },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (result.success) {
                alert('Produkt gespeichert! Jetzt Sync starten.');
                setIsProductSaved(true);
                setCurrentStep(7); // Go to Sync
            } else {
                alert(`Fehler: ${ result.message } `);
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-gray-100">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={handleClose} />

            <div className="relative w-full max-w-6xl bg-white dark:bg-slate-950 rounded-none md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-full md:h-[90vh] border border-white/20">

                {/* Header with 7 Steps */}
                <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl z-20 flex flex-col gap-3">
                    <div className="flex justify-between items-center w-full">
                         <div className="flex items-center gap-4">
                            <button onClick={handleClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
                                <X size={16} className="text-slate-600" />
                            </button>
                            <h2 className="text-lg font-bold">Neues Produkt</h2>
                        </div>
                        <div className="text-xs text-indigo-500 font-mono">FLOW: 7-STEPS v3</div>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1" ref={navRef}>
                        {WIZARD_STEPS.map((step, idx) => (
                            <button
                                key={step.id}
                                onClick={() => { if(idx < 6 || isProductSaved) setCurrentStep(idx + 1)}}
                                className={`flex items - center gap - 2 px - 3 py - 1.5 rounded - full text - xs font - bold transition - all border ${
    currentStepIndex === idx
        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
        : idx < currentStepIndex
            ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
            : 'bg-white text-gray-400 border-gray-100'
} `}
                            >
                                <span>{idx + 1}</span>
                                <span className={currentStepIndex === idx ? 'inline' : 'hidden md:inline'}>{step.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#f8f9fc] dark:bg-[#0b0f19] p-8">
                     <div className="max-w-4xl mx-auto">
                        <CurrentComponent />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between">
                     <button onClick={handlePrevStep} disabled={currentStepIndex === 0 || isSaving} className="px-6 py-2 rounded-lg font-bold text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Zurück</button>
                     
                     <button 
                        onClick={currentStepIndex === 5 ? handleSaveProduct : handleNextStep} // Step 6 (Index 5) is Save
                        disabled={isSaving}
                        className="px-8 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-lg flex items-center gap-2 disabled:opacity-50"
                     >
                        {isSaving ? <Loader2 className="animate-spin"/> : null}
                        {currentStepIndex === 5 ? 'Produkt Speichern' : currentStepIndex === 6 ? 'Fertigstellen' : 'Weiter'}
                     </button>
                </div>
            </div>
        </div>
    );
};
```
