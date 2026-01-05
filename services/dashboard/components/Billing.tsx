import React, { useEffect, useState } from 'react';
import { CreditCard, Zap, Shield, Check } from 'lucide-react';
import { billingService, UserCredits } from '../services/billingService';
import { useAuthStore } from '../store/authStore';

export const Billing: React.FC = () => {
    const { user } = useAuthStore();
    const [credits, setCredits] = useState<UserCredits | null>(null);

    useEffect(() => {
        if (user) {
            billingService.getCredits(user.id).then(setCredits);
        }
    }, [user]);

    return (
        <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-10">
            <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold font-serif-display text-slate-900 dark:text-white">Abrechnung & Plan</h1>
                <p className="text-slate-500 mt-2 text-lg">Verwalte dein Guthaben und wähle den passenden Plan.</p>
            </div>

            {/* Current Status Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <p className="text-indigo-200 font-medium mb-1 uppercase tracking-wider text-sm">Aktuelles Guthaben</p>
                        <h2 className="text-5xl font-bold font-display">{credits ? credits.credits : 0} <span className="text-2xl font-normal opacity-80">Credits</span></h2>
                        <p className="mt-4 inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                            <Shield size={14} />
                            Aktiver Plan: <span className="font-bold uppercase">{credits?.plan || 'Free'}</span>
                        </p>
                    </div>
                    <div>
                        <button className="px-8 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg active:scale-95">
                            Guthaben aufladen
                        </button>
                    </div>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Free Plan */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-indigo-200 transition-colors">
                    <h3 className="text-xl font-bold mb-2">Starter</h3>
                    <p className="text-3xl font-bold mb-6">€0 <span className="text-sm font-normal text-slate-500">/Monat</span></p>
                    <ul className="space-y-3 mb-8">
                        <li className="flex items-center gap-3 text-sm text-slate-600"><Check size={16} className="text-green-500" /> 100 Credits / Monat</li>
                        <li className="flex items-center gap-3 text-sm text-slate-600"><Check size={16} className="text-green-500" /> 1 Verbindung</li>
                        <li className="flex items-center gap-3 text-sm text-slate-600"><Check size={16} className="text-green-500" /> Standard Support</li>
                    </ul>
                    <button className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-medium transition-colors">Aktueller Plan</button>
                </div>

                {/* Pro Plan */}
                <div className="bg-slate-900 text-white p-8 rounded-3xl border-2 border-indigo-500 shadow-xl relative scale-105">
                    <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">POPULÄR</div>
                    <h3 className="text-xl font-bold mb-2">Business</h3>
                    <p className="text-3xl font-bold mb-6">€49 <span className="text-sm font-normal text-slate-400">/Monat</span></p>
                    <ul className="space-y-3 mb-8 text-slate-300">
                        <li className="flex items-center gap-3 text-sm"><Check size={16} className="text-indigo-400" /> 5.000 Credits / Monat</li>
                        <li className="flex items-center gap-3 text-sm"><Check size={16} className="text-indigo-400" /> 5 Verbindungen</li>
                        <li className="flex items-center gap-3 text-sm"><Check size={16} className="text-indigo-400" /> Priority Sync</li>
                    </ul>
                    <button className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold transition-colors">Upgrade</button>
                </div>

                {/* Enterprise */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-indigo-200 transition-colors">
                    <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                    <p className="text-3xl font-bold mb-6">€199 <span className="text-sm font-normal text-slate-500">/Monat</span></p>
                    <ul className="space-y-3 mb-8">
                        <li className="flex items-center gap-3 text-sm text-slate-600"><Check size={16} className="text-green-500" /> Unlimitiert Credits</li>
                        <li className="flex items-center gap-3 text-sm text-slate-600"><Check size={16} className="text-green-500" /> Unlimitiert Verbindungen</li>
                        <li className="flex items-center gap-3 text-sm text-slate-600"><Check size={16} className="text-green-500" /> 24/7 Support</li>
                    </ul>
                    <button className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-medium transition-colors">Kontaktieren</button>
                </div>
            </div>
        </div>
    );
};