import React from 'react';
import { X, Trash2, ArrowRight, CreditCard, ShieldCheck, Zap } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const cartItems = [
    {
      id: 1,
      title: 'Professional Plan Upgrade',
      subtitle: 'Monatliche Abrechnung',
      price: 99.00,
      icon: ShieldCheck,
      color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300'
    },
    {
      id: 2,
      title: 'SEO Power Pack',
      subtitle: 'Add-on Modul',
      price: 19.90,
      icon: Zap,
      color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-300'
    }
  ];

  const total = cartItems.reduce((acc, item) => acc + item.price, 0);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className={`fixed inset-y-0 right-0 z-[70] w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold font-serif-display text-slate-900 dark:text-white">Warenkorb</h2>
            <span className="bg-indigo-600 dark:bg-indigo-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{cartItems.length}</span>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-4 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors group">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                <item.icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{item.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{item.subtitle}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">€{item.price.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
              <button className="self-center p-2 text-slate-300 hover:text-red-500 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">Möchten Sie weitere Kanäle hinzufügen?</p>
            <button className="text-indigo-600 dark:text-indigo-400 font-bold text-sm mt-1 hover:underline">Zum Marketplace</button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-slate-500 dark:text-slate-400 text-sm">
              <span>Zwischensumme</span>
              <span>€{total.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400 text-sm">
              <span>MwSt. (19%)</span>
              <span>€{(total * 0.19).toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between text-slate-900 dark:text-white font-bold text-lg pt-3 border-t border-slate-200 dark:border-slate-700">
              <span>Gesamtsumme</span>
              <span>€{(total * 1.19).toFixed(2).replace('.', ',')}</span>
            </div>
          </div>

          <button className="w-full py-3.5 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-indigo-700 transition-colors shadow-lg flex items-center justify-center gap-2 text-center">
            <span>Zur Kasse</span>
            <ArrowRight size={18} />
          </button>
          <div className="flex items-center justify-center gap-2 mt-4 text-slate-400 dark:text-slate-500 text-xs">
             <CreditCard size={12} />
             <span>Sichere SSL-Verschlüsselung</span>
          </div>
        </div>

      </div>
    </>
  );
};