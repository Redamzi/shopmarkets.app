import React from 'react';
import { useProductWizardStore } from '../store/productWizardStore';
import { ProductTypeSelector } from './ProductWizard/ProductTypeSelector';
import { AIGenerator } from './ProductWizard/AIGenerator';
import { MediaUpload } from './ProductWizard/MediaUpload';
import { PricingInventory } from './ProductWizard/PricingInventory';
import { AttributesVariants } from './ProductWizard/AttributesVariants';
import { SEOMarketing } from './ProductWizard/SEOMarketing';
import { ChannelsSync } from './ProductWizard/ChannelsSync';
import { SEOPreview } from './ProductWizard/SEOPreview';
import { ReadyCheck } from './ProductWizard/ReadyCheck';
import { PreviewSave } from './ProductWizard/PreviewSave';

export const ProductWizard: React.FC = () => {
    const { currentStep } = useProductWizardStore();

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    {currentStep === 1 && <ProductTypeSelector />}
                    {currentStep === 2 && <AIGenerator />}
                    {currentStep === 3 && <MediaUpload />}
                    {currentStep === 4 && <PricingInventory />}
                    {currentStep === 5 && <AttributesVariants />}
                    {currentStep === 6 && <SEOMarketing />}
                    {currentStep === 7 && <ChannelsSync />}
                    {currentStep === 8 && <SEOPreview />}
                    {currentStep === 9 && <ReadyCheck />}
                    {currentStep === 10 && <PreviewSave />}
                </div>
                <div className="text-right text-xs text-gray-400 mt-2">
                    Wizard v1.0.1 (Fixes Applied)
                </div>
            </div>
        </div>
    );
};
