import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const { setUser, setSession } = useAuthStore();

    // Login Steps: 1 = Credentials, 2 = 2FA Code
    const [step, setStep] = useState(1);
    const [userId, setUserId] = useState('');

    // Form Data
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [trustDevice, setTrustDevice] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Google Login (Placeholder)
    const handleGoogleLogin = () => {
        window.location.href = 'https://auth.shopmarkets.app/api/auth/google';
    };

    // Step 1: E-Mail & Passwort senden
    const handleCredentials = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await authService.loginStep1(email, password);

            // Check if 2FA was skipped (trusted device)
            if (data.skipTwoFactor && data.token && data.user) {
                setUser(data.user);
                setSession({ access_token: data.token });
                navigate('/dashboard');
            } else if (data.requires2FA && data.userId) {
                setUserId(data.userId);
                setStep(2); // Weiter zu Step 2
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login fehlgeschlagen. Bitte Daten prüfen.');
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: 2FA Code verifizieren
    const handleVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Generate device fingerprint (simple version - can be enhanced)
            const deviceFingerprint = await generateDeviceFingerprint();

            const { user, session } = await authService.loginStep2(userId, code, trustDevice, deviceFingerprint);
            if (user && session) {
                setUser(user);
                setSession(session);
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Falscher Code. Bitte erneut versuchen.');
        } finally {
            setIsLoading(false);
        }
    };

    // Generate device fingerprint
    const generateDeviceFingerprint = async (): Promise<string> => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const txt = 'fingerprint';
        if (ctx) {
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillText(txt, 2, 2);
        }

        const fingerprint = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            screenResolution: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            canvas: canvas.toDataURL()
        };

        // Simple hash function
        const str = JSON.stringify(fingerprint);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-600/20">
                        {step === 1 ? <LogIn className="text-white" size={32} /> : <ShieldCheck className="text-white" size={32} />}
                    </div>
                    <h1 className="text-3xl font-bold font-serif-display text-slate-900 dark:text-white">
                        {step === 1 ? 'Willkommen zurück' : 'Sicherheits-Check'}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        {step === 1 ? 'Melde dich bei ShopMarkets an' : `Wir haben einen Code an ${email} gesendet`}
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 border border-slate-100 dark:border-slate-700">

                    {/* Error Display */}
                    {error && (
                        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
                            <AlertCircle className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" size={20} />
                            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                        </div>
                    )}

                    {step === 1 ? (
                        <>
                            {/* Google Button */}
                            <button
                                onClick={handleGoogleLogin}
                                className="w-full bg-white dark:bg-slate-700 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 font-medium py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-3 mb-6"
                            >
                                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                                Mit Google anmelden
                            </button>

                            <div className="relative mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white dark:bg-slate-800 text-slate-500">oder mit E-Mail</span>
                                </div>
                            </div>

                            {/* STEP 1 FORM */}
                            <form onSubmit={handleCredentials} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">E-Mail</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-900 dark:text-white"
                                            placeholder="deine@email.de"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Passwort</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-900 dark:text-white"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    <div className="text-right">
                                        <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                                            Passwort vergessen?
                                        </Link>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : 'Code anfordern'}
                                </button>
                            </form>
                        </>
                    ) : (
                        /* STEP 2 FORM */
                        <form onSubmit={handleVerification} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Sicherheitscode</label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="w-full text-center text-3xl tracking-[0.5em] font-mono py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-slate-900 dark:text-white"
                                    placeholder="000000"
                                    maxLength={6}
                                    autoFocus
                                    required
                                />
                                <p className="text-xs text-center text-slate-500 mt-2">Bitte prüfe deinen Spam-Ordner</p>
                            </div>

                            {/* Trust Device Checkbox */}
                            <div className="flex items-start gap-3 pt-2">
                                <div className="pt-0.5">
                                    <input
                                        type="checkbox"
                                        id="trustDevice"
                                        checked={trustDevice}
                                        onChange={(e) => setTrustDevice(e.target.checked)}
                                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                    />
                                </div>
                                <label htmlFor="trustDevice" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                                    <span className="font-medium text-slate-900 dark:text-white">Diesem Gerät vertrauen</span>
                                    <br />
                                    <span className="text-xs text-slate-500">Du wirst auf diesem Gerät 30 Tage lang nicht nach einem Code gefragt.</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : 'Verifizieren & Anmelden'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full text-sm text-slate-500 hover:text-indigo-600 transition-colors"
                            >
                                ← Zurück zum Login
                            </button>
                        </form>
                    )}

                    {/* Footer Links - FIXED VISIBILITY */}
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 space-y-4">
                        <div className="text-center">
                            <p className="text-slate-600 dark:text-slate-400">
                                Noch kein Account?{' '}
                                <Link
                                    to="/register"
                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                                >
                                    Jetzt kostenlos registrieren
                                </Link>
                            </p>
                        </div>

                        <div className="text-center">
                            <a
                                href="https://shopmarkets.app"
                                className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                            >
                                ← Zurück zur Startseite
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
