import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowRight, Zap, Star, MoreHorizontal } from 'lucide-react';
import { ANALYTICS_DATA, MOCK_LOGS } from '../constants';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up">
      
      {/* Hero Banner - Bento Style with Glow */}
      <div className="relative w-full bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 lg:p-12 flex flex-col md:flex-row items-start md:items-center justify-between overflow-hidden shadow-2xl shadow-indigo-500/30 text-white group">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-purple-500/30 rounded-full blur-[100px] -mr-20 -mt-20 mix-blend-overlay pointer-events-none animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-[20rem] h-[20rem] bg-indigo-400/20 rounded-full blur-[80px] -ml-10 -mb-10 pointer-events-none"></div>

        <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-4">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                System Operational
            </div>
            <h2 className="text-4xl lg:text-6xl font-display font-bold leading-tight mb-4">
                ShopMarkets<span className="text-indigo-200">.app</span>
            </h2>
            <p className="text-indigo-100 text-lg mb-8 max-w-md leading-relaxed opacity-90">
                Orchestrieren Sie Ihr E-Commerce-Universum. Echtzeit-Sync, AI-Produktmanagement und Multi-Channel-Skalierung.
            </p>
            <div className="flex flex-wrap gap-4">
                <button className="px-8 py-4 bg-white text-indigo-900 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-2">
                    Jetzt syncen <Zap size={18} className="fill-indigo-900" />
                </button>
                <button className="px-8 py-4 bg-indigo-800/40 text-white rounded-2xl font-bold border border-white/10 hover:bg-indigo-800/60 backdrop-blur-md transition-all">
                    Analytics
                </button>
            </div>
        </div>
        
        {/* 3D-ish Floating Elements */}
        <div className="hidden lg:block absolute right-16 top-1/2 -translate-y-1/2 w-80 h-80 pointer-events-none">
             {/* Floating Cards Animation */}
             <div className="absolute right-0 top-0 w-48 p-4 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl animate-float z-20">
                 <div className="flex items-center gap-3 mb-3">
                     <div className="w-10 h-10 rounded-full bg-orange-400/20 flex items-center justify-center text-orange-200"><Zap size={20} /></div>
                     <div>
                         <div className="h-2 w-16 bg-white/40 rounded-full mb-1"></div>
                         <div className="h-2 w-10 bg-white/20 rounded-full"></div>
                     </div>
                 </div>
                 <div className="h-20 bg-gradient-to-tr from-white/5 to-white/0 rounded-2xl border border-white/10"></div>
             </div>

             <div className="absolute left-0 bottom-10 w-40 p-4 bg-indigo-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl animate-float [animation-delay:2s] z-10">
                 <div className="flex justify-between items-center mb-2">
                    <div className="h-2 w-8 bg-white/40 rounded-full"></div>
                    <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                 </div>
                 <div className="text-2xl font-tech font-bold">98%</div>
                 <div className="text-[10px] text-indigo-200 uppercase tracking-wide">Efficiency</div>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Chart Section - Bento Box */}
        <div className="lg:col-span-2 bg-white dark:bg-[#131b2e] rounded-[2.5rem] p-8 border border-slate-200/50 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Revenue Flow</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Cross-channel performance overview</p>
                </div>
                <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
                        <MoreHorizontal size={20} />
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Gesamtumsatz</p>
                    <h4 className="text-3xl font-tech font-bold text-slate-900 dark:text-white">€12.450</h4>
                    <span className="text-xs font-bold text-green-500 flex items-center gap-1 mt-1 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full w-fit">
                        <ArrowUpRight size={12} /> +15.2%
                    </span>
                </div>
                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bestellungen</p>
                    <h4 className="text-3xl font-tech font-bold text-slate-900 dark:text-white">843</h4>
                    <span className="text-xs font-bold text-slate-400 mt-1 block">
                        Diese Woche
                    </span>
                </div>
                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sync Rate</p>
                    <h4 className="text-3xl font-tech font-bold text-indigo-600 dark:text-indigo-400">99.8%</h4>
                    <span className="text-xs font-bold text-indigo-600/60 dark:text-indigo-400/60 mt-1 block">
                        Real-time
                    </span>
                </div>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ANALYTICS_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
                        dy={10} 
                    />
                    <Tooltip 
                        cursor={{ fill: 'rgba(99, 102, 241, 0.05)', radius: 16 }}
                        contentStyle={{ 
                            borderRadius: '16px', 
                            border: 'none', 
                            background: '#1e1b4b', 
                            color: '#fff',
                            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)'
                        }}
                        itemStyle={{ color: '#a5b4fc' }}
                    />
                    <Bar 
                        dataKey="syncs" 
                        fill="url(#colorGradient)" 
                        radius={[8, 8, 8, 8]} 
                        barSize={24} 
                    />
                    <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                    </defs>
                </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Right Column Cards */}
        <div className="space-y-6 lg:space-y-8">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Live Feed</h3>
                <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">View All</button>
            </div>

            <div className="space-y-4">
                {MOCK_LOGS.slice(0, 3).map((log, i) => (
                    <div key={log.id} className="group bg-white dark:bg-[#131b2e] p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all duration-300 cursor-pointer relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                                i === 0 ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-500' : 
                                i === 1 ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-500' : 
                                'bg-blue-50 dark:bg-blue-900/20 text-blue-500'
                            }`}>
                                <Zap size={20} fill="currentColor" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h5 className="font-bold text-slate-900 dark:text-white truncate text-base">{log.productName}</h5>
                                    <span className="font-tech font-bold text-slate-900 dark:text-white text-sm">€40.10</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{log.source}</span>
                                    <ArrowRight size={12} className="text-slate-300" />
                                    <span className="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wide">{log.target}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                
                 <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700/50 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-all group">
                    <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all mb-3 shadow-sm">
                        <ArrowRight size={24} />
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white">Kompletten Verlauf ansehen</p>
                    <p className="text-sm text-slate-500">Alle 1.240 Events anzeigen</p>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};