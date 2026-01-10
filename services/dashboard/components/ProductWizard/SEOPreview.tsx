import React from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';

export const SEOPreview: React.FC = () => {
    const { stepData, completeStep, setCurrentStep } = useProductWizardStore();
    const seoData = stepData[6]?.seo || {};
    const images = stepData[3]?.images || [];

    const titleLength = seoData.title?.length || 0;
    const descLength = seoData.description?.length || 0;
    const imageCount = images.length;

    const getTitleStatus = () => {
        if (titleLength >= 50 && titleLength <= 60) return { status: '✅ Gut', color: 'text-green-500' };
        if (titleLength > 0) return { status: '⚠️ Verbesserung möglich', color: 'text-orange-500' };
        return { status: '❌ Fehlt', color: 'text-red-500' };
    };

    const getDescStatus = () => {
        if (descLength >= 150 && descLength <= 160) return { status: '✅ Perfekt', color: 'text-green-500' };
        if (descLength > 0) return { status: '⚠️ Verbesserung möglich', color: 'text-orange-500' };
        return { status: '❌ Fehlt', color: 'text-red-500' };
    };

    const getImageStatus = () => {
        if (imageCount >= 3) return { status: '✅ Gut', color: 'text-green-500' };
        if (imageCount >= 1) return { status: '⚠️ Mehr empfohlen', color: 'text-orange-500' };
        return { status: '❌ Fehlt', color: 'text-red-500' };
    };

    const handleNext = () => {
        completeStep(8);
        setCurrentStep(9);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-2">SEO-Vorschau</h2>
            <p className="text-gray-600 mb-6">Überprüfen Sie die SEO-Optimierung Ihres Produkts</p>

            <div className="space-y-4">
                <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold">Titel-Länge</h3>
                            <p className="text-sm text-gray-600">{titleLength} Zeichen (optimal: 50-60)</p>
                        </div>
                        <span className={getTitleStatus().color}>{getTitleStatus().status}</span>
                    </div>
                </div>

                <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold">Beschreibung</h3>
                            <p className="text-sm text-gray-600">{descLength} Zeichen (optimal: 150-160)</p>
                        </div>
                        <span className={getDescStatus().color}>{getDescStatus().status}</span>
                    </div>
                </div>

                <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold">Bilder</h3>
                            <p className="text-sm text-gray-600">{imageCount} Bild(er) (empfohlen: 3-5)</p>
                        </div>
                        <span className={getImageStatus().color}>{getImageStatus().status}</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 mt-8">
                <button
                    onClick={handleNext}
                    className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600"
                >
                    Weiter
                </button>
            </div>
        </div>
    );
};
