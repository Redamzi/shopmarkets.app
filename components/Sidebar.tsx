import React from 'react';
import { LayoutDashboard, Package, Share2, Activity, Settings, CreditCard, Plus, Facebook, Twitter, Instagram, Globe, X } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onAddProduct?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onAddProduct, isOpen = false, onClose }) => {
  const navItems = [
    { id: 'dashboard', label: 'Übersicht', icon: LayoutDashboard },
    { id: 'products', label: 'Produkte', icon: Package },
    { id: 'connections', label: 'Kanäle', icon: Share2 },
    { id: 'history', label: 'Verlauf', icon: Activity },
    { id: 'billing', label: 'Abrechnung', icon: CreditCard },
    { id: 'settings', label: 'Einstellungen', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay Background */}
      <div 
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 lg:w-64 flex flex-col h-full 
        bg-[#f3f4f6] dark:bg-slate-950 lg:bg-transparent
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0 lg:shadow-none'}
        py-6 lg:py-8 pl-6 pr-4
      `}>
        
        <div className="mb-8 lg:mb-12 pl-2 flex items-center justify-between">
          <div className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
            <div className="w-10 h-10 bg-slate-900 dark:bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-slate-900/20 dark:shadow-indigo-500/20">
              <Package size={20} />
            </div>
            <span className="font-bold text-xl font-serif-display tracking-wide">ShopMarkets</span>
          </div>
          
          {/* Mobile Close Button */}
          <button 
            onClick={onClose}
            className="lg:hidden w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-3 lg:space-y-4 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-black/20 text-slate-900 dark:text-white translate-x-2'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:pl-6'
                }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : ''} />
                <span className={`font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-8 space-y-6 lg:space-y-8">
          <button 
            onClick={() => {
                if (onAddProduct) onAddProduct();
                if (onClose) onClose();
            }}
            className="w-full bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-4 px-4 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-transform active:scale-95"
          >
              <span className="font-medium">Produkt hinzufügen</span>
              <Plus size={20} />
          </button>

          <div className="flex gap-3 justify-center justify-start px-2">
              <button className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:border-slate-300 hover:text-slate-600 dark:hover:text-slate-300 transition-colors bg-transparent">
                  <Facebook size={16} />
              </button>
               <button className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:border-slate-300 hover:text-slate-600 dark:hover:text-slate-300 transition-colors bg-transparent">
                  <Twitter size={16} />
              </button>
               <button className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:border-slate-300 hover:text-slate-600 dark:hover:text-slate-300 transition-colors bg-transparent">
                  <Globe size={16} />
              </button>
          </div>
        </div>
      </div>
    </>
  );
};