import React, { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Shield, Check, X, Download, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface AVVModalProps {
    isOpen: boolean;
    onSigned: () => void;
}

export const AVVModal: React.FC<AVVModalProps> = ({ isOpen, onSigned }) => {
    const { user } = useAuthStore();
    const sigCanvas = useRef<SignatureCanvas>(null);
    const [loading, setLoading] = useState(false);
    const [loadingSignature, setLoadingSignature] = useState(true);
    const [isSigned, setIsSigned] = useState(false);
    const [signatureData, setSignatureData] = useState<string | null>(null);
    const [signedAt, setSignedAt] = useState<string | null>(null);
    const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const AUTH_URL = 'https://security.shopmarkets.app/api/auth';

    // Check if user already signed
    useEffect(() => {
        if (isOpen && user) {
            checkSignatureStatus(user.id);
        }
    }, [isOpen, user]);

    // Check if content is scrolled to bottom
    useEffect(() => {
        if (contentRef.current) {
            const { scrollHeight, clientHeight } = contentRef.current;
            if (scrollHeight <= clientHeight) {
                setIsScrolledToBottom(true);
            }
        }
    }, [isOpen]);

    const checkSignatureStatus = async (userId: string) => {
        try {
            const response = await fetch(`${AUTH_URL}/avv/signature/${userId}`);
            const data = await response.json();

            if (data.is_signed) {
                setIsSigned(true);
                setSignatureData(data.signature_data);
                setSignedAt(data.signed_at);
            }
        } catch (error) {
            console.error('Error checking signature:', error);
        } finally {
            setLoadingSignature(false);
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            setIsScrolledToBottom(true);
        }
    };

    const clear = () => {
        sigCanvas.current?.clear();
    };

    const save = async () => {
        if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
            alert('Bitte unterschreiben Sie zuerst.');
            return;
        }

        setLoading(true);
        const signatureDataToSave = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${AUTH_URL}/sign-avv`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    signature_data: signatureDataToSave
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Fehler beim Speichern');
            }

            setIsSigned(true);
            setSignatureData(signatureDataToSave);
            setSignedAt(new Date().toISOString());

            // Call parent callback
            onSigned();

        } catch (error) {
            console.error('Sign error:', error);
            alert('Fehler beim Speichern der Unterschrift.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isOpen) return null;

    if (loadingSignature) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            </div>
        );
    }

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
                    ref={contentRef}
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

                    <div className="h-20"></div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-b-3xl">
                    {isSigned ? (
                        /* Signed State */
                        <div className="space-y-6">
                            <div className="relative w-full h-[200px] border-2 border-solid border-emerald-500/30 bg-emerald-500/5 rounded-xl flex flex-col items-center justify-center">
                                <img src={signatureData!} alt="Signature" className="max-h-32 opacity-90" />
                                <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                    <Check className="w-4 h-4 text-emerald-500" />
                                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-wide">Verifiziert</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <span className="text-emerald-600 dark:text-emerald-300 font-medium">
                                        Vertrag rechtsgültig unterzeichnet
                                    </span>
                                </div>
                                <span className="text-sm text-slate-400 font-mono">
                                    {signedAt && formatDate(signedAt)}
                                </span>
                            </div>
                        </div>
                    ) : (
                        /* Unsigned State */
                        <div className="space-y-6">
                            <div className="relative w-full h-[200px] bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-500/50 rounded-xl cursor-crosshair transition-colors">
                                <SignatureCanvas
                                    ref={sigCanvas}
                                    canvasProps={{
                                        className: 'w-full h-full absolute inset-0 z-10 rounded-xl',
                                    }}
                                    penColor="#6366f1"
                                    backgroundColor="transparent"
                                />

                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
                                    <span className="text-slate-400 text-xl select-none">
                                        Unterschrift hier
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 mb-6">
                                <input
                                    type="checkbox"
                                    id="accept"
                                    checked={accepted}
                                    onChange={(e) => setAccepted(e.target.checked)}
                                    disabled={!isScrolledToBottom}
                                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:opacity-50 mt-0.5"
                                />
                                <label htmlFor="accept" className={`text-sm cursor-pointer select-none ${!isScrolledToBottom ? 'opacity-50' : ''}`}>
                                    <span className="font-medium text-slate-900 dark:text-white">Ich habe den AVV gelesen und stimme zu.</span>
                                    <br />
                                    <span className="text-slate-500">Bitte scrollen Sie bis zum Ende, um zuzustimmen.</span>
                                </label>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={clear}
                                    className="px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl font-medium transition-colors"
                                >
                                    Löschen
                                </button>

                                <button
                                    onClick={save}
                                    disabled={!accepted || loading}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            <span>Speichern...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check size={20} />
                                            <span>Vertrag digital unterzeichnen</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
