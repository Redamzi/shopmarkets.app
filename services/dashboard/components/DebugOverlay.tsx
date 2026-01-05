import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Bug, ChevronDown, ChevronUp, Activity, Database, Server } from 'lucide-react';

export const DebugOverlay: React.FC = () => {
    // Nur rendern in Production wenn explizit gewünscht (hier lassen wir es immer drin wie besprochen)
    // const isDev = process.env.NODE_ENV === 'development'; 

    const [isOpen, setIsOpen] = useState(false);
    const { user, session } = useAuthStore();
    const [ping, setPing] = useState<number | null>(null);

    // Simulierter Ping Check zum Backend
    useEffect(() => {
        if (!isOpen) return;

        const checkPing = async () => {
            const start = Date.now();
            try {
                await fetch('https://security.shopmarkets.app/health');
                setPing(Date.now() - start);
            } catch (e) {
                setPing(-1); // Error
            }
        };

        checkPing();
        const interval = setInterval(checkPing, 5000);
        return () => clearInterval(interval);
    }, [isOpen]);

    return (
        <div className="fixed bottom-4 right-4 z-[9999] font-mono text-xs">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-lg transition-all ${isOpen
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300'
                    }`}
            >
                <Bug size={14} />
                <span className="font-bold">DEV MODE</span>
                {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>

            {/* Panel */}
            {isOpen && (
                <div className="mt-2 w-64 bg-slate-900/95 text-slate-300 p-4 rounded-xl shadow-2xl backdrop-blur border border-slate-700">
                    <div className="space-y-3">
                        {/* User Check */}
                        <div>
                            <div className="text-slate-500 uppercase text-[10px] tracking-wider mb-1 font-bold">User Context</div>
                            <div className="flex justify-between">
                                <span>Status:</span>
                                <span className={user ? 'text-emerald-400' : 'text-red-400'}>
                                    {user ? 'Authenticated' : 'Guest'}
                                </span>
                            </div>
                            {user && (
                                <>
                                    <div className="flex justify-between mt-1">
                                        <span>ID:</span>
                                        <span className="text-slate-100 truncate w-32 text-right" title={user.id}>{user.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>AVV Signed:</span>
                                        <span className={user.is_avv_signed ? 'text-emerald-400' : 'text-orange-400'}>
                                            {String(user.is_avv_signed)}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="h-px bg-slate-700 my-2"></div>

                        {/* System Status */}
                        <div>
                            <div className="text-slate-500 uppercase text-[10px] tracking-wider mb-1 font-bold">System Health</div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1"><Server size={10} /> Security API:</span>
                                <span className={`flex items-center gap-1 ${ping === -1 ? 'text-red-500' : ping && ping < 200 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                                    {ping === -1 ? 'OFFLINE' : ping ? `${ping}ms` : 'Checking...'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                                <span className="flex items-center gap-1"><Database size={10} /> Local Store:</span>
                                <span className="text-emerald-400">{session ? 'Active' : 'Empty'}</span>
                            </div>
                        </div>

                        <div className="h-px bg-slate-700 my-2"></div>

                        <div className="text-[10px] text-slate-500 text-center">
                            ShopMarkets DevTools v0.1
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
