import React from 'react';
import { Check, CreditCard, Download, Shield, Sparkles, Coins, Plus } from 'lucide-react';

interface BillingProps {
    credits?: number;
}

export const Billing: React.FC<BillingProps> = ({ credits = 0 }) => {
  return (
    <div className="space-y-8 lg:space-y-12 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
         <div>
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-slate-900 dark:text-white">Guthaben & Plans</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Pay-as-you-go für AI Power. Keine versteckten Kosten.</p>
         </div>
      </div>

      {/* Wallet & Status Section - Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Credit Balance Card - Glass/Holo Effect */}
          <div className="lg:col-span-2 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-[#1e293b] dark:to-[#0f172a] rounded-[2.5rem] p-8 lg:p-10 text-white relative overflow-hidden flex flex-col justify-between shadow-2xl shadow-slate-900/10 border border-white/10 group">
              
              {/* Animated Background Orbs */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/30 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-indigo-500/40 transition-colors duration-700"></div>
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/20 rounded-full blur-[60px] -ml-10 -mb-10"></div>
              
              <div className="relative z-10 flex justify-between items-start">
                  <div>
                      <div className="flex items-center gap-2 mb-4">
                          <span className="bg-white/10 border border-white/20 backdrop-blur-md text-indigo-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-2">
                              <Sparkles size={12} className="text-yellow-300 fill-yellow-300" />
                              AI Balance
                          </span>
                      </div>
                      <h3 className="text-5xl lg:text-7xl font-tech font-bold mb-2 tracking-tight">{credits}</h3>
                      <p className="text-slate-300 font-medium">Verfügbare Credits</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-500/30 transform rotate-3 group-hover:rotate-6 transition-transform">
                      <Coins size={32} className="text-white" />
                  </div>
              </div>

              <div className="relative z-10 mt-10">
                  <div className="w-full bg-white/5 rounded-full h-3 mb-3 overflow-hidden border border-white/5">
                      <div className="bg-gradient-to-r from-indigo-400 to-purple-400 h-full rounded-full shadow-[0_0_15px_rgba(129,140,248,0.5)]" style={{ width: `${Math.min(100, credits)}%` }}></div>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <span>Starter Bonus</span>
                      <span className="text-white">{credits} / 1000</span>
                  </div>
              </div>
          </div>

          {/* Core Plan Status - Clean Bento */}
          <div className="bg-white dark:bg-[#131b2e] rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl"></div>
              
              <div>
                  <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400 mb-6">
                      <Shield size={28} />
                  </div>
                  <h4 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Core Plan</h4>
                  <span className="inline-block mt-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg uppercase tracking-wide">
                      Lifetime Free
                  </span>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/50">
                  <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0"><Check size={10} strokeWidth={4} /></div>
                          Unbegrenzte Kanäle
                      </li>
                      <li className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0"><Check size={10} strokeWidth={4} /></div>
                          Real-time Sync
                      </li>
                  </ul>
              </div>
          </div>
      </div>

      {/* Credit Packages */}
      <div>
          <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6">Credits aufladen</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                  { 
                      name: 'Starter', 
                      credits: 50,
                      price: '€15', 
                      perCredit: '€0,30 / Credit',
                      popular: false,
                      color: 'bg-white dark:bg-[#131b2e] border-slate-200 dark:border-slate-800'
                  },
                  { 
                      name: 'Business', 
                      credits: 200,
                      price: '€49', 
                      perCredit: '€0,25 / Credit',
                      popular: true,
                      color: 'bg-white dark:bg-[#131b2e] border-indigo-200 dark:border-indigo-900 ring-4 ring-indigo-50 dark:ring-indigo-900/20'
                  },
                  { 
                      name: 'Agency', 
                      credits: 1000,
                      price: '€199', 
                      perCredit: '€0,20 / Credit',
                      popular: false,
                      color: 'bg-white dark:bg-[#131b2e] border-slate-200 dark:border-slate-800'
                  }
              ].map((pack) => (
                  <div key={pack.name} className={`${pack.color} rounded-[2.5rem] p-8 border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative flex flex-col items-center text-center group`}>
                      {pack.popular && (
                          <div className="absolute -top-4 bg-indigo-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-indigo-600/30">
                              Bestseller
                          </div>
                      )}
                      
                      <div className="mt-2 mb-4">
                          <h4 className="text-xl font-display font-bold text-slate-900 dark:text-white">{pack.name}</h4>
                      </div>

                      <div className="mb-6 relative">
                          <span className="text-5xl font-tech font-bold text-slate-900 dark:text-white">{pack.credits}</span>
                          <span className="absolute -right-8 -top-2 text-xl">✨</span>
                          <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide mt-2">AI Credits</span>
                      </div>

                      <div className="w-full border-t border-slate-100 dark:border-slate-800 my-2"></div>

                      <div className="mb-8 mt-4">
                          <span className="text-3xl font-tech font-bold text-slate-900 dark:text-white">{pack.price}</span>
                          <span className="block text-xs font-medium text-slate-400 mt-1">{pack.perCredit}</span>
                      </div>

                      <button className={`w-full py-4 rounded-2xl font-bold transition-all justify-center text-center flex items-center gap-2 ${
                          pack.popular 
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}>
                          <Plus size={18} strokeWidth={3} /> Aufladen
                      </button>
                  </div>
              ))}
          </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white dark:bg-[#131b2e] rounded-[2.5rem] p-8 lg:p-10 border border-slate-200 dark:border-slate-800">
          <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6">Letzte Transaktionen</h3>
          <div className="space-y-2">
              {[
                  { id: 'INV-001', date: '01. Dez 2024', desc: 'Starter Pack (50 Credits)', amount: '€15,00', status: 'Bezahlt' },
              ].map((inv) => (
                  <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-3xl transition-colors group cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                      <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:shadow-sm transition-all">
                              <Download size={20} />
                          </div>
                          <div>
                              <p className="font-bold text-slate-900 dark:text-white text-base">{inv.desc}</p>
                              <p className="text-xs font-medium text-slate-400 font-mono mt-1">{inv.date} • {inv.id}</p>
                          </div>
                      </div>
                      <div className="text-right mt-3 sm:mt-0 pl-16 sm:pl-0">
                          <p className="font-tech font-bold text-slate-900 dark:text-white text-lg">{inv.amount}</p>
                          <p className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full inline-block mt-1 uppercase tracking-wide">{inv.status}</p>
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};