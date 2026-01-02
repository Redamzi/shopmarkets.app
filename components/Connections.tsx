import React, { useState } from 'react';
import { Plus, RefreshCw, ExternalLink, Settings, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { ConnectionStatus, Connection } from '../types';
import { AddChannelModal } from './AddChannelModal';

interface ConnectionsProps {
    connections: Connection[];
    onAddConnection: (connection: Connection) => void;
}

export const Connections: React.FC<ConnectionsProps> = ({ connections, onAddConnection }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConnect = (newConnection: Connection) => {
    onAddConnection(newConnection);
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <AddChannelModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnect={handleConnect}
      />

      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-2xl lg:text-3xl font-bold font-serif-display text-slate-900 dark:text-white">Vertriebskanäle</h2>
            <p className="text-sm lg:text-base text-slate-500 dark:text-slate-400 mt-1">Aktive Integrationen verwalten</p>
         </div>
         <button 
            onClick={() => setIsModalOpen(true)}
            className="w-10 h-10 lg:w-12 lg:h-12 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-slate-800 dark:hover:bg-indigo-700 transition-colors"
         >
            <Plus size={20} />
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {connections.map((conn, idx) => {
            // Dynamic styling based on index for variety, adapted for dark mode
            const cardColor = idx === 0 ? 'bg-[#ecfccb] dark:bg-lime-900/30' : idx === 1 ? 'bg-[#e0e7ff] dark:bg-indigo-900/30' : idx === 2 ? 'bg-[#ffedd5] dark:bg-orange-900/30' : 'bg-slate-50 dark:bg-slate-800/50';
            const iconBg = idx === 0 ? 'bg-[#84cc16] text-white' : idx === 1 ? 'bg-[#6366f1] text-white' : idx === 2 ? 'bg-[#f97316] text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-200';
            const textColor = 'text-slate-900 dark:text-white';

            return (
                <div key={conn.id} className={`${cardColor} rounded-[32px] lg:rounded-[40px] p-6 lg:p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-300 animate-in fade-in zoom-in-95 border border-transparent dark:border-white/5`}>
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

                    <div className="relative z-10 flex flex-col h-full justify-between min-h-[180px] lg:min-h-[220px]">
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl ${iconBg} flex items-center justify-center text-lg lg:text-xl font-bold shadow-lg uppercase`}>
                                    {conn.platform.charAt(0)}
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/60 dark:bg-black/30 backdrop-blur-sm ${
                                    conn.status === ConnectionStatus.ACTIVE ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                                }`}>
                                    {conn.status === 'active' ? 'Aktiv' : 'Fehler'}
                                </div>
                            </div>
                            
                            <h3 className={`text-lg lg:text-xl font-bold ${textColor} mb-1`}>{conn.name}</h3>
                            <a href={conn.url.startsWith('http') ? conn.url : `https://${conn.url}`} target="_blank" rel="noreferrer" className="text-xs lg:text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 opacity-70 truncate max-w-[200px]">
                                {conn.url} <ExternalLink size={12} />
                            </a>
                        </div>

                        <div className="flex items-center justify-between mt-6 lg:mt-8">
                            <div>
                                <p className="text-[10px] lg:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold opacity-60">Letzter Sync</p>
                                <p className={`text-sm font-medium ${textColor}`}>{conn.lastSyncAt}</p>
                            </div>
                            <button className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white dark:bg-slate-700 text-slate-900 dark:text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                                <RefreshCw size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )
        })}
        
        {/* Add New Card */}
        <button 
            onClick={() => setIsModalOpen(true)}
            className="rounded-[32px] lg:rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:border-indigo-400 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all min-h-[200px] lg:min-h-[280px]"
        >
            <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                <Plus size={24} />
            </div>
            <span className="font-bold text-lg">Kanal hinzufügen</span>
        </button>
      </div>
    </div>
  );
};