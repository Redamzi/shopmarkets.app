import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowRight, Zap, Package, Share2, Activity, ChevronRight, TrendingUp } from 'lucide-react';
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

    // Mock-Chart Daten
    const ANALYTICS_DATA = [
        { name: 'Mo', value: 45 }, { name: 'Di', value: 52 }, { name: 'Mi', value: 38 },
        { name: 'Do', value: 65 }, { name: 'Fr', value: 48 }, { name: 'Sa', value: 25 }, { name: 'So', value: 15 },
    ];

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-8 animate-fade-in-up">

            {/* Page Header */}
            <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    <span>ShopMarkets</span>
                    <span className="text-slate-300">•</span>
                    <span>Übersicht</span>
                </div>
                <h1 className="text-4xl font-serif-display font-bold text-slate-900 dark:text-white">
                    Übersicht
                </h1>
            </div>

            {/* Hero Banner */}
            <div className="relative w-full bg-[#6366f1] rounded-[2.5rem] p-8 lg:p-12 overflow-hidden shadow-2xl text-white">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-3xl translate-y-1/2"></div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-6">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]"></span>
                            System Operational
                        </div>

                        <h2 className="text-4xl lg:text-5xl font-display font-bold leading-tight mb-4">
                            ShopMarkets.app
                        </h2>

                        <p className="text-indigo-100 text-lg mb-8 max-w-lg opacity-90 leading-relaxed">
                            Orchestrieren Sie Ihr E-Commerce-Universum. <br />
                            Echtzeit-Sync, AI-Produktmanagement und Multi-Channel-Skalierung.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <button onClick={() => navigate('/products')} className="px-6 py-3 bg-white text-indigo-700 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg flex items-center gap-2">
                                Jetzt syncen <Zap size={18} fill="currentColor" />
                            </button>
                            <button onClick={() => navigate('/sync-history')} className="px-6 py-3 bg-indigo-700/50 hover:bg-indigo-700/70 text-white border border-indigo-400/30 rounded-xl font-bold transition-all flex items-center gap-2">
                                Analytics
                            </button>
                        </div>
                    </div>

                    {/* Floating Info Card (Mockup) */}
                    <div className="hidden lg:block relative">
                        {/* Card 1 */}
                        <div className="absolute -top-32 -right-12 w-64 h-40 bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-4 transform rotate-6">
                            <div className="flex gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-400/30"></div>
                                <div className="flex-1 h-2 bg-indigo-400/30 rounded-full mt-3"></div>
                            </div>
                            <div className="h-20 bg-indigo-400/20 rounded-2xl"></div>
                        </div>

                        {/* Card 2 (Efficiency) */}
                        <div className="relative bg-[#2e2e48]/80 backdrop-blur-xl border border-white/10 p-6 rounded-3xl w-56 shadow-2xl">
                            <div className="flex justify-between items-start mb-2">
                                <div className="text-3xl font-bold">98%</div>
                                <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
                            </div>
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Efficiency</div>
                            <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[98%] rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Left Column: Performance / Revenue Flow */}
                <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Performance Overview</h3>
                            <p className="text-sm text-slate-500">Cross-channel performance overview</p>
                        </div>
                        <button className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
                            <Activity size={20} />
                        </button>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {/* Box 1 */}
                        <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Gesamt Produkte</div>
                            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stats?.totalProducts}</div>
                            <div className="flex items-center gap-1 text-xs font-bold text-green-500">
                                <TrendingUp size={12} /> +12.5%
                            </div>
                        </div>
                        {/* Box 2 */}
                        <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Aktive Kanäle</div>
                            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stats?.totalConnections}</div>
                            <div className="text-xs text-slate-500">Verbunden</div>
                        </div>
                        {/* Box 3 */}
                        <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Syncs</div>
                            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stats?.totalSyncs}</div>
                            <div className="text-xs text-slate-500 text-blue-500 font-medium">Real-time</div>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ANALYTICS_DATA} barSize={20}>
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    dy={10}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar
                                    dataKey="value"
                                    fill="#6366f1"
                                    radius={[6, 6, 6, 6]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Column: Live Feed */}
                <div className="space-y-6">
                    <div className="flex justify-between items-end px-2">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Live Feed</h3>
                        <button onClick={() => navigate('/sync-history')} className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
                            View All
                        </button>
                    </div>

                    <div className="space-y-4">
                        {stats?.recentLogs.map((log: any, i) => (
                            <div key={log.id || i} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${log.status === 'success'
                                        ? 'bg-orange-50 text-orange-500' // Using orange icon like in screenshot example
                                        : 'bg-red-50 text-red-500'
                                    }`}>
                                    <Zap size={20} fill="currentColor" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                        Multi-Channel Sync
                                    </p>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-0.5">
                                        <span>{log.platform || 'Shopify'}</span>
                                        <ArrowRight size={10} />
                                        <span>MasterShop</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {log.status === 'success' ? 'OK' : 'ERR'}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* "Kompletten Verlauf ansehen" Big Button/Card */}
                        <div
                            onClick={() => navigate('/sync-history')}
                            className="bg-slate-100 dark:bg-slate-800 p-6 rounded-[2rem] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors group"
                        >
                            <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                <ArrowRight size={20} />
                            </div>
                            <p className="font-bold text-slate-900 dark:text-white">Kompletten Verlauf ansehen</p>
                            <p className="text-xs text-slate-500 mt-1">Alle Sync-Events anzeigen</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};