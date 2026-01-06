import React, { useEffect, useState } from 'react';
import { CheckCircle, Circle, RefreshCw, X, ArrowRight, ShieldCheck, Globe, Layers, Tag, Truck, Package } from 'lucide-react';

interface Step {
    id: string;
    label: string;
    status: 'pending' | 'loading' | 'completed' | 'error';
    icon: React.ReactNode;
}

interface ConnectionWizardProps {
    isOpen: boolean;
    onClose: () => void;
    platformName: string; // e.g. 'WooCommerce'
    onConnect?: (data: any) => void;
}

export const ConnectionWizard: React.FC<ConnectionWizardProps> = ({ isOpen, onClose, platformName }) => {
    const [steps, setSteps] = useState<Step[]>([
        { id: 'auth', label: 'Verbindung autorisieren', status: 'completed', icon: <ShieldCheck size={18} /> },
        { id: 'settings', label: 'Globale Einstellungen & Währungen', status: 'loading', icon: <Globe size={18} /> },
        { id: 'categories', label: 'Shop-Kategorien synchronisieren', status: 'pending', icon: <Layers size={18} /> },
        { id: 'attributes', label: 'Attribute & Varianten mappen', status: 'pending', icon: <Tag size={18} /> },
        { id: 'shipping', label: 'Versandprofile importieren', status: 'pending', icon: <Truck size={18} /> },
        { id: 'inventory', label: 'Bestellungen abgleichen (Inventar)', status: 'pending', icon: <Package size={18} /> },
    ]);

    const [isFinished, setIsFinished] = useState(false);

    // Simulate progress
    useEffect(() => {
        if (!isOpen) return;

        let currentStepIndex = 1; // Start at index 1 (0 is already completed)

        const interval = setInterval(() => {
            setSteps(prev => {
                const newSteps = [...prev];

                // Complete current step
                if (newSteps[currentStepIndex].status === 'loading') {
                    newSteps[currentStepIndex].status = 'completed';

                    // Start next step
                    if (currentStepIndex + 1 < newSteps.length) {
                        currentStepIndex++;
                        newSteps[currentStepIndex].status = 'loading';
                    } else {
                        // All done
                        clearInterval(interval);
                        setIsFinished(true);
                    }
                }
                return newSteps;
            });
        }, 1500); // 1.5 seconds per step

        return () => clearInterval(interval);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in-up">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative">

                {/* Close Button (only when finished) */}
                {isFinished && (
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 transition-colors">
                        <X size={20} />
                    </button>
                )}

                <div className="p-8 text-center border-b border-slate-100 dark:border-slate-800 relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-400/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full mb-6 text-green-500 shadow-lg shadow-green-100 dark:shadow-none">
                            <CheckCircle size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Erfolgreich verbunden!</h2>
                        <p className="text-slate-500">
                            <span className="font-semibold text-slate-900 dark:text-white">{platformName}</span> wurde hinzugefügt. <br />
                            Wir importieren jetzt Ihre Daten.
                        </p>
                    </div>
                </div>

                <div className="p-6 bg-slate-50/50 dark:bg-slate-800/20">
                    <div className="space-y-4">
                        {steps.map((step, index) => (
                            <div key={step.id} className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 ${step.status === 'loading' ? 'bg-white dark:bg-slate-800 shadow-sm scale-[1.02] border border-indigo-100 dark:border-indigo-900/30' : ''}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500
                                    ${step.status === 'completed' ? 'bg-indigo-600 text-white' :
                                        step.status === 'loading' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' :
                                            'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                                    {step.status === 'loading' ? <RefreshCw size={18} className="animate-spin" /> :
                                        step.status === 'completed' ? <CheckCircle size={18} /> :
                                            step.icon}
                                </div>
                                <div className="flex-1">
                                    <div className={`font-medium text-sm ${step.status === 'pending' ? 'text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                        {step.label}
                                    </div>
                                    {step.status === 'loading' && (
                                        <div className="text-xs text-indigo-500 mt-0.5 animate-pulse">Wird verarbeitet...</div>
                                    )}
                                </div>
                                {step.status === 'completed' && <div className="text-indigo-600"><CheckCircle size={16} className="opacity-0 lg:opacity-100" /></div>}
                            </div>
                        ))}
                    </div>

                    {isFinished ? (
                        <button
                            onClick={onClose}
                            className="w-full mt-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2 group"
                        >
                            <span>Abschließen & Zum Dashboard</span>
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    ) : (
                        <div className="text-center mt-8 text-xs text-slate-400">
                            Bitte schließen Sie dieses Fenster nicht, bis der Vorgang abgeschlossen ist.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
