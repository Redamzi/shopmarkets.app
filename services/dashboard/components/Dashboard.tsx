import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowRight, Zap, MoreHorizontal, Package, Share2, Activity } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.shopmarkets.app';

interface DashboardStats {
    totalProducts: number;
    totalConnections: number;
    totalSyncs: number;
    recentLogs: any[];
}

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${API_URL}/api/dashboard/stats`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setStats(response.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    // Mock-Chart Daten für die Optik (da wir keine Historical-Stats im Backend haben bisher)
    const ANALYTICS_DATA = [
        { name: 'Mo', syncs: 45 }, { name: 'Di', syncs: 52 }, { name: 'Mi', syncs: 38 },
        { name: 'Do', syncs: 65 }, { name: 'Fr', syncs: 48 }, { name: 'Sa', syncs: 25 }, { name: 'So', syncs: 15 },
    ];

    if (loading) return <div className="p-10 text-center">Lade Dashboard...</div>;

    return (
        <div className="space-y-6 lg:space-y-8 animate-fade-in-up">

            {/* Hero Banner */}
            <div className="relative w-full bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between overflow-hidden shadow-2xl text-white">
                <div className="relative z-10 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-4">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        System Live
                    </div>
                    <h2 className="text-4xl lg:text-6xl font-display font-bold leading-tight mb-4">
                        ShopMarkets<span className="text-indigo-200">.app</span>
                    </h2>
                    <p className="text-indigo-100 text-lg mb-8 max-w-md opacity-90">
                        Ihr Shop-System läuft. {stats?.totalProducts} Produkte und {stats?.totalConnections} Kanäle sind aktiv.
                    </p>
                    <div className="flex gap-4">
                        <button onClick={() => navigate('/products')} className="px-8 py-3 bg-white text-indigo-900 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-lg flex items-center gap-2">
                            Produkte verwalten <Package size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

                {/* Stats Grid */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Total Products */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg"><Package size={20} /></div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Produkte</p>
                            </div>
                            <h4 className="text-3xl font-tech font-bold text-slate-900 dark:text-white">{stats?.totalProducts}</h4>
                        </div>
                        {/* Connections */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg"><Share2 size={20} /></div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kanäle</p>
                            </div>
                            <h4 className="text-3xl font-tech font-bold text-slate-900 dark:text-white">{stats?.totalConnections}</h4>
                        </div>
                        {/* Syncs */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg"><Activity size={20} /></div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Syncs</p>
                            </div>
                            <h4 className="text-3xl font-tech font-bold text-slate-900 dark:text-white">{stats?.totalSyncs}</h4>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200/50 dark:border-slate-800 shadow-sm h-80">
                        <h3 className="text-xl font-bold mb-6">Aktivität (Demo)</h3>
                        <ResponsiveContainer width="100%" height="80%">
                            <BarChart data={ANALYTICS_DATA}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="syncs" fill="#6366f1" radius={[6, 6, 6, 6]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Column: Recent Logs */}
                <div className="space-y-6">
                    <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Letzte Syncs</h3>
                    <div className="space-y-4">
                        {stats?.recentLogs.length === 0 ? (
                            <p className="text-slate-500">Keine Aktivitäten gefunden.</p>
                        ) : (
                            stats?.recentLogs.map((log: any) => (
                                <div key={log.id} className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <Zap size={18} className="text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-900 dark:text-white capitalize">{log.platform} Sync</p>
                                        <p className="text-xs text-slate-500">{new Date(log.started_at).toLocaleTimeString()}</p>
                                    </div>
                                    <div className="ml-auto">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>{log.status}</span>
                                    </div>
                                </div>
                            ))
                        )}

                        <button onClick={() => navigate('/sync-history')} className="w-full py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors">
                            Alle Logs ansehen
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};