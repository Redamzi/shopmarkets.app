import React, { useState, useEffect } from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';
import { Tags, Palette, Ruler, Scale, Plus, Trash2, Sliders, ListPlus } from 'lucide-react';

export const AttributesVariants: React.FC = () => {
    const { productType, stepData, setStepData } = useProductWizardStore();
    const savedData = stepData[4] || {};

    const [attributes, setAttributes] = useState({
        material: savedData.attributes?.material || '',
        color: savedData.attributes?.color || '',
        size: savedData.attributes?.size || '',
        weight: savedData.attributes?.weight || ''
    });

    // Custom Attributes (Key/Value)
    const [customAttributes, setCustomAttributes] = useState<{ name: string, value: string }[]>(
        savedData.attributes?.custom || []
    );

    const [variants, setVariants] = useState<any[]>(savedData.variants || []);

    const needsVariants = ['configurable', 'bundle', 'personalized'].includes(productType || '');

    const addVariant = () => {
        setVariants([...variants, { name: '', values: '', sku: '', price: '' }]);
    };

    const updateVariant = (index: number, field: string, value: string) => {
        const updated = [...variants];
        updated[index][field] = value;
        setVariants(updated);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    // Custom Attributes Handlers
    const addCustomAttribute = () => {
        setCustomAttributes([...customAttributes, { name: '', value: '' }]);
    };

    const updateCustomAttribute = (index: number, field: 'name' | 'value', val: string) => {
        const updated = [...customAttributes];
        updated[index][field] = val;
        setCustomAttributes(updated);
    };

    const removeCustomAttribute = (index: number) => {
        setCustomAttributes(customAttributes.filter((_, i) => i !== index));
    };


    // Auto-Sync to Key 4
    useEffect(() => {
        setStepData(4, {
            attributes: {
                ...attributes,
                custom: customAttributes
            },
            variants: variants.map((v: any) => ({
                name: v.name,
                values: typeof v.values === 'string' ? v.values.split(',').map((s: string) => s.trim()) : v.values,
                sku: v.sku,
                price: parseFloat(v.price) || 0
            }))
        });
    }, [attributes, customAttributes, variants, setStepData]);

    return (
        <div className="max-w-4xl mx-auto p-2 md:p-6">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                    <Sliders size={28} strokeWidth={1.5} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold font-serif-display text-slate-900 dark:text-white">Attribute & Varianten</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Produkteigenschaften und Varianten definieren.</p>
                </div>
            </div>

            <div className="space-y-8">
                {/* Attributes Section */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Tags size={20} className="text-indigo-500" />
                        Basis Attribute
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                <Tags size={16} className="text-indigo-500" />
                                Material
                            </label>
                            <input
                                type="text"
                                value={attributes.material}
                                onChange={(e) => setAttributes({ ...attributes, material: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-lg font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                placeholder="z.B. Baumwolle"
                            />
                        </div>
                        <div className="group">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                <Palette size={16} className="text-indigo-500" />
                                Farbe
                            </label>
                            <input
                                type="text"
                                value={attributes.color}
                                onChange={(e) => setAttributes({ ...attributes, color: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-lg font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                placeholder="z.B. Schwarz"
                            />
                        </div>
                        <div className="group">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                <Ruler size={16} className="text-indigo-500" />
                                Größe
                            </label>
                            <input
                                type="text"
                                value={attributes.size}
                                onChange={(e) => setAttributes({ ...attributes, size: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-lg font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                placeholder="z.B. M, L, XL"
                            />
                        </div>
                        <div className="group">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                <Scale size={16} className="text-indigo-500" />
                                Gewicht
                            </label>
                            <input
                                type="text"
                                value={attributes.weight}
                                onChange={(e) => setAttributes({ ...attributes, weight: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-lg font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                placeholder="z.B. 1.2kg"
                            />
                        </div>
                    </div>

                    {/* Custom Attributes */}
                    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <ListPlus size={20} className="text-indigo-500" />
                                Weitere Eigenschaften
                            </h3>
                            <button
                                onClick={addCustomAttribute}
                                className="text-indigo-600 dark:text-indigo-400 font-bold text-sm bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition flex items-center gap-2"
                            >
                                <Plus size={16} />
                                Eigenschaft hinzufügen
                            </button>
                        </div>

                        <div className="space-y-3">
                            {customAttributes.map((attr, index) => (
                                <div key={index} className="flex gap-4 items-center animate-in slide-in-from-left-2 duration-300">
                                    <input
                                        placeholder="Name (z.B. Rahmen)"
                                        value={attr.name}
                                        onChange={(e) => updateCustomAttribute(index, 'name', e.target.value)}
                                        className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500"
                                    />
                                    <input
                                        placeholder="Wert (z.B. Aluminium)"
                                        value={attr.value}
                                        onChange={(e) => updateCustomAttribute(index, 'value', e.target.value)}
                                        className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500"
                                    />
                                    <button
                                        onClick={() => removeCustomAttribute(index)}
                                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 transition"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                            {customAttributes.length === 0 && (
                                <p className="text-sm text-slate-400 italic">Keine weiteren Eigenschaften.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Variants Section - Only if needed */}
                {needsVariants && (
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Sliders size={20} className="text-indigo-500" />
                                Varianten
                            </h3>
                            <button
                                onClick={addVariant}
                                className="relative flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/30 active:scale-95"
                            >
                                <Plus size={20} />
                                Variante hinzufügen
                            </button>
                        </div>

                        <div className="space-y-4">
                            {variants.map((variant, index) => (
                                <div key={index} className="border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-6 bg-slate-50/50 dark:bg-slate-800/50 hover:border-indigo-200 transition-colors">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                                        <div className="group">
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Name</label>
                                            <input
                                                type="text"
                                                value={variant.name}
                                                onChange={(e) => updateVariant(index, 'name', e.target.value)}
                                                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-indigo-500 outline-none"
                                                placeholder="z.B. Größe"
                                            />
                                        </div>
                                        <div className="group">
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Werte</label>
                                            <input
                                                type="text"
                                                value={variant.values}
                                                onChange={(e) => updateVariant(index, 'values', e.target.value)}
                                                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-indigo-500 outline-none"
                                                placeholder="M, L, XL"
                                            />
                                        </div>
                                        <div className="group">
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">SKU</label>
                                            <input
                                                type="text"
                                                value={variant.sku}
                                                onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-indigo-500 outline-none"
                                                placeholder="SKU-001"
                                            />
                                        </div>
                                        <div className="flex gap-2 items-end">
                                            <div className="flex-1 group">
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Preis</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={variant.price}
                                                    onChange={(e) => updateVariant(index, 'price', e.target.value)}
                                                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-indigo-500 outline-none"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <button
                                                onClick={() => removeVariant(index)}
                                                className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 hover:text-red-600 transition border border-red-100"
                                                title="Variante entfernen"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {variants.length === 0 && (
                                <div className="text-center py-8 text-slate-400 italic bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                    Noch keine Varianten hinzugefügt.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
