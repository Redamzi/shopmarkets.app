import React from 'react';
import { MOCK_LOGS } from '../constants';
import { SyncStatus } from '../types';
import { CheckCircle, XCircle, ArrowRight, Clock } from 'lucide-react';

export const SyncHistory: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-4">
        <div>
            <h2 className="text-2xl lg:text-3xl font-bold font-serif-display text-slate-900">Verlauf</h2>
            <p className="text-sm lg:text-base text-slate-500 mt-1">Letzte Synchronisierungsereignisse</p>
        </div>
        <div className="bg-white rounded-full px-3 lg:px-4 py-2 text-xs lg:text-sm font-medium text-slate-600 shadow-sm border border-slate-100 flex items-center gap-2">
            <Clock size={16} />
            <span className="hidden md:inline">Letzte 24 Std</span>
            <span className="md:hidden">24 Std</span>
        </div>
      </div>

      <div className="space-y-4">
          {MOCK_LOGS.map((log) => (
              <div key={log.id} className="group bg-white rounded-3xl p-4 lg:p-6 border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-300 flex items-center gap-4 lg:gap-6">
                  
                  {/* Status Icon */}
                  <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      log.status === SyncStatus.SUCCESS 
                        ? 'bg-green-50 text-green-500' 
                        : 'bg-red-50 text-red-500'
                  }`}>
                      {log.status === SyncStatus.SUCCESS ? <CheckCircle size={20} className="lg:w-6 lg:h-6" /> : <XCircle size={20} className="lg:w-6 lg:h-6" />}
                  </div>

                  {/* Main Info */}
                  <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 text-base lg:text-lg mb-1 truncate">{log.productName}</h4>
                      <div className="flex items-center gap-2 lg:gap-3 text-xs lg:text-sm text-slate-500">
                          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-[10px] lg:text-xs text-slate-600">{log.sku}</span>
                          <span>•</span>
                          <span>{log.timestamp}</span>
                      </div>
                  </div>

                  {/* Flow Visualization (Hidden on small mobile) */}
                  <div className="hidden sm:flex items-center gap-2 lg:gap-3 px-3 lg:px-6 py-2 lg:py-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="font-bold text-slate-700 capitalize text-xs lg:text-base">{log.source}</span>
                      <ArrowRight size={14} className="text-slate-400 lg:w-4 lg:h-4" />
                      <span className="font-bold text-slate-700 capitalize text-xs lg:text-base">{log.target}</span>
                  </div>

                  {/* Message/Action */}
                  <div className="text-right hidden md:block">
                       {log.status === SyncStatus.FAILED && (
                           <span className="text-xs font-medium text-red-500 bg-red-50 px-3 py-1 rounded-full">{log.message || "Fehler"}</span>
                       )}
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};