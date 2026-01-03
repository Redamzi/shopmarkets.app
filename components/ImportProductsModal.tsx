import React, { useState, useEffect } from 'react';
import { X, Download, Check, AlertCircle, Loader2, ShoppingBag, Store, ShoppingCart, Layers, ArrowRight, Database, Coins } from 'lucide-react';
import { Product, Platform } from '../types';

interface ImportProductsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportBatch: (products: Product[]) => void;
    credits: number;
    onDeductCredits: (amount: number) => void;
}

const CHANNELS = [
    { id: 'shopify', label: 'Shopify Store', icon: ShoppingBag, count: 342, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
    { id: 'woocommerce', label: 'WooCommerce', icon: Store, count: 85, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
    { id: 'amazon', label: 'Amazon Seller', icon: ShoppingCart, count: 1240, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
    { id: 'magento', label: 'Magento Adobe', icon: Layers, count: 12, color: 'text-orange-700 bg-orange-100 dark:bg-orange-900/20' },
];

export const ImportProductsModal: React.FC<ImportProductsModalProps> = ({ isOpen, onClose, onImportBatch, credits, onDeductCredits }) => {
    const [step, setStep] = useState(1);
    const [selectedChannel, setSelectedChannel] = useState<typeof CHANNELS[0] | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const [importedCount, setImportedCount] = useState(0);

    // Constants
    const FREE_LIMIT = 30;
    const BATCH_SIZE_COST = 10;
    const PROCESSING_BATCH_SIZE = 50; // Visual batch size for the loop

    if (!isOpen) return null;

    const calculateCost = (totalProducts: number) => {
        if (totalProducts <= FREE_LIMIT) return 0;
        const chargeable = totalProducts - FREE_LIMIT;
        return Math.ceil(chargeable / BATCH_SIZE_COST);
    };

    const cost = selectedChannel ? calculateCost(selectedChannel.count) : 0;
    const canAfford = credits >= cost;

    const handleStartImport = async () => {
        if (!selectedChannel || !canAfford) return;

        // Deduct credits
        if (cost > 0) {
            onDeductCredits(cost);
        }

        setStep(3);
        setIsImporting(true);
        setLogs(['Initialisiere Verbindung...', `Lade ${selectedChannel.count} Produkte von ${selectedChannel.label}...`]);

        const total = selectedChannel.count;
        let current = 0;

        // Recursive Batch Function
        const processBatch = () => {
            setTimeout(() => {
                const nextBatchSize = Math.min(PROCESSING_BATCH_SIZE, total - current);
                current += nextBatchSize;

                // Create Mock Products for this batch
                const newProducts: Product[] = Array.from({ length: nextBatchSize }).map((_, i) => ({
                    id: `imp_${Date.now()}_${i}`,
                    sku: `${selectedChannel.id.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 10000)}`,
                    title: `${selectedChannel.label} Product ${current - nextBatchSize + i + 1}`,
                    price: parseFloat((Math.random() * 100).toFixed(2)),
                    stock: Math.floor(Math.random() * 50),
                    imageUrl: `https://picsum.photos/200?random=${Math.random()}`,
                    channels: [selectedChannel.id as Platform],
                    lastSync: new Date().toISOString(),
                    category: 'Imported',
                }));

                // Send batch to App
                onImportBatch(newProducts);

                // Update UI
                setImportedCount(current);
                const percentage = Math.round((current / total) * 100);
                setProgress(percentage);
                setLogs(prev => [`Batch verarbeitet: ${current} / ${total} Produkte`, ...prev]);

                // Next step or Finish
                if (current < total) {
                    processBatch();
                } else {
                    setIsImporting(false);
                    setLogs(prev => ['Import erfolgreich abgeschlossen!', ...prev]);
                    setTimeout(() => setStep(4), 800);
                }
            }, 800); // Artificial delay per batch
        };

        processBatch();
    };

    const resetModal = () => {
        setStep(1);
        setSelectedChannel(null);
        setProgress(0);
        setLogs([]);
        setImportedCount(0);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-none md:rounded-[32px] shadow-2xl overflow-hidden flex flex-col h-full md:h-auto md:max-h-[90vh] animate-in zoom-in-95 duration-200 border-0 md:border border-slate-100 dark:border-slate-800">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold font-serif-display text-slate-900 dark:text-white">Produkte importieren</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Mass-Import aus verbundenen Kanälen</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-800/50 flex-1">

                    {/* STEP 1: Select Channel */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Wähle eine Quelle</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {CHANNELS.map(channel => (
                                    <button
                                        key={channel.id}
                                        onClick={() => { setSelectedChannel(channel); setStep(2); }}
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all text-left group shadow-sm hover:shadow-md"
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${channel.color}`}>
                                            <channel.icon size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white">{channel.label}</h4>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                <Database size={12} />
                                                <span>{channel.count} Produkte</span>
                                            </div>
                                        </div>
                                        <ArrowRight size={16} className="ml-auto text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Calculate Cost */}
                    {step === 2 && selectedChannel && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-5">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${selectedChannel.color}`}>
                                    <selectedChannel.icon size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedChannel.label}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">{selectedChannel.count} Produkte gefunden</p>
                                </div>
                            </div>

                            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl p-6 border border-indigo-100 dark:border-indigo-800 relative overflow-hidden">
                                <div className="relative z-10">
                                    <h4 className="font-bold text-indigo-900 dark:text-indigo-200 mb-4 flex items-center gap-2">
                                        <Coins size={18} /> Kostenberechnung
                                    </h4>

                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-center text-indigo-800 dark:text-indigo-300">
                                            <span>Gesamtanzahl</span>
                                            <span className="font-mono">{selectedChannel.count}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                                            <span>Freigrenze (Kostenlos)</span>
                                            <span className="font-mono">-{FREE_LIMIT}</span>
                                        </div>
                                        <div className="h-px bg-indigo-200 dark:bg-indigo-800/50 my-2"></div>
                                        <div className="flex justify-between items-center font-bold text-slate-900 dark:text-white text-base">
                                            <span>Benötigte Credits</span>
                                            <span className="bg-indigo-600 text-white px-3 py-1 rounded-lg">{cost} Credits</span>
                                        </div>
                                    </div>

                                    <div className={`mt-6 p-3 rounded-xl flex items-center gap-3 text-sm ${canAfford ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'}`}>
                                        {canAfford ? <Check size={18} /> : <AlertCircle size={18} />}
                                        <div className="flex-1 font-medium">
                                            Ihr Guthaben: {credits} Credits
                                            {!canAfford && <span className="block text-xs opacity-80 mt-0.5">Bitte laden Sie Ihr Konto auf.</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Importing */}
                    {step === 3 && (
                        <div className="text-center py-8">
                            <div className="relative w-24 h-24 mx-auto mb-6">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200 dark:text-slate-700" />
                                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-indigo-600 transition-all duration-500 ease-out" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * progress) / 100} />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-xl font-bold text-slate-900 dark:text-white">{progress}%</span>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Importiere Produkte...</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{importedCount} von {selectedChannel?.count} verarbeitet</p>

                            <div className="bg-slate-900 text-left p-4 rounded-xl h-32 overflow-y-auto custom-scrollbar font-mono text-xs text-green-400 shadow-inner">
                                {logs.map((log, i) => (
                                    <div key={i} className="mb-1">{'>'} {log}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Success */}
                    {step === 4 && (
                        <div className="text-center py-10">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mx-auto mb-6 animate-in zoom-in">
                                <Check size={40} strokeWidth={4} />
                            </div>
                            <h3 className="text-2xl font-bold font-serif-display text-slate-900 dark:text-white mb-2">Import erfolgreich!</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-8">
                                Es wurden <span className="font-bold text-slate-900 dark:text-white">{importedCount} Produkte</span> zu Ihrem Inventar hinzugefügt.
                            </p>
                            <button
                                onClick={resetModal}
                                className="px-8 py-3 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:transform hover:-translate-y-0.5 transition-all"
                            >
                                Fertig
                            </button>
                        </div>
                    )}

                </div>

                {/* Footer Actions */}
                {step < 3 && (
                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between shrink-0">
                        {step === 2 ? (
                            <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                                Zurück
                            </button>
                        ) : (
                            <div></div>
                        )}

                        {step === 1 && (
                            <button
                                disabled={!selectedChannel}
                                onClick={() => setStep(2)}
                                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors ml-auto"
                            >
                                Weiter
                            </button>
                        )}

                        {step === 2 && (
                            <button
                                disabled={!canAfford}
                                onClick={handleStartImport}
                                className={`px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all ${canAfford
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20'
                                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                <Download size={18} />
                                Jetzt Importieren
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};