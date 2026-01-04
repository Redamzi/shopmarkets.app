import React, { useState } from 'react';
import { Shield, FileText, Check, Loader2, Download } from 'lucide-react';
import { authService } from '../services/authService';

interface AVVModalProps {
    isOpen: boolean;
    onSigned: () => void;
}

export const AVVModal: React.FC<AVVModalProps> = ({ isOpen, onSigned }) => {
    const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            setIsScrolledToBottom(true);
        }
    };

    const handleSign = async () => {
        setIsLoading(true);
        try {
            // API Call um Timestamp zu speichern
            // await authService.signAVV(); // TODO: Implement in Backend

            // Simuliert
            setTimeout(() => {
                setIsLoading(false);
                onSigned();
            }, 1000);
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">AVV-Vertrag unterzeichnen</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Notwendig für die DSGVO-Konformität</p>
                    </div>
                </div>

                {/* Content */}
                <div
                    className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900 mx-2 my-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 leading-relaxed"
                    onScroll={handleScroll}
                >
                    <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Vertrag zur Auftragsverarbeitung (AVV)</h3>

                    <p className="mb-4">
                        Zwischen<br />
                        <strong>Ihnen (dem Auftraggeber)</strong><br />
                        und<br />
                        <strong>ShopMarkets (dem Auftragnehmer)</strong>
                    </p>

                    <p className="mb-4">
                        wird folgender Vertrag zur Auftragsverarbeitung gemäß Art. 28 DSGVO geschlossen:
                    </p>

                    <h4 className="font-bold mb-2">1. Gegenstand und Dauer des Auftrags</h4>
                    <p className="mb-4">
                        Der Auftraggeber beauftragt den Auftragnehmer mit der Verarbeitung personenbezogener Daten im Rahmen der Nutzung der ShopMarkets Software.
                        Die Dauer dieses Auftrags entspricht der Laufzeit des Hauptvertrags.
                    </p>

                    <h4 className="font-bold mb-2">2. Art und Zweck der Verarbeitung</h4>
                    <p className="mb-4">
                        Die Verarbeitung umfasst das Erheben, Speichern, Nutzen und Löschen von Kundendaten (Namen, Adressen, Bestellungen) zum Zwecke der E-Commerce-Verwaltung und Synchronisierung.
                    </p>

                    <h4 className="font-bold mb-2">3. Kategorien betroffener Personen</h4>
                    <p className="mb-4">
                        Kunden, Interessenten, Mitarbeiter und Lieferanten des Auftraggebers.
                    </p>

                    <h4 className="font-bold mb-2">4. Rechte und Pflichten</h4>
                    <p className="mb-4">
                        Der Auftragnehmer verpflichtet sich, Daten nur auf Weisung des Auftraggebers zu verarbeiten und geeignete technische und organisatorische Maßnahmen (TOMs) zum Schutz der Daten zu ergreifen.
                    </p>

                    <p className="mb-4">
                        (Dies ist ein gekürzter Beispieltext. Der vollständige rechtliche Text würde hier stehen.)
                    </p>

                    <div className="h-20"></div> {/* Spacer */}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-b-3xl">
                    <div className="flex items-start gap-3 mb-6">
                        <div className="pt-0.5">
                            <input
                                type="checkbox"
                                id="accept"
                                checked={accepted}
                                onChange={(e) => setAccepted(e.target.checked)}
                                disabled={!isScrolledToBottom}
                                className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
                            />
                        </div>
                        <label htmlFor="accept" className={`text-sm cursor-pointer select-none ${!isScrolledToBottom ? 'opacity-50' : ''}`}>
                            <span className="font-medium text-slate-900 dark:text-white">Ich habe den AVV gelesen und stimme zu.</span>
                            <br />
                            <span className="text-slate-500">Bitte scrollen Sie bis zum Ende, um zuzustimmen.</span>
                        </label>
                    </div>

                    <div className="flex justify-between items-center">
                        <button className="text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-2">
                            <Download size={16} />
                            PDF Herunterladen
                        </button>

                        <button
                            onClick={handleSign}
                            disabled={!accepted || isLoading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                            Vertrag digital unterzeichnen
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
