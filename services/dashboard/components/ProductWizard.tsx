import React from 'react';
import { useProductWizardStore } from '../store/productWizardStore';
import { ProductTypeSelector } from './ProductWizard/ProductTypeSelector';
import { AIGenerator } from './ProductWizard/AIGenerator';

export const ProductWizard: React.FC = () => {
    const { currentStep } = useProductWizardStore();

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    {currentStep === 1 && <ProductTypeSelector />}
                    {currentStep === 2 && <AIGenerator />}
                    {currentStep >= 3 && (
                        <div className="text-center py-12">
                            <p className="text-lg">Step {currentStep} - Coming soon...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
