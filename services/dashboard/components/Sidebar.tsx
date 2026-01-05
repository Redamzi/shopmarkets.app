import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Share2, Activity, Settings, CreditCard, Plus, LogOut, X, Facebook, Twitter, Globe } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onToggle }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const navItems = [
    { path: '/dashboard', label: 'Übersicht', icon: LayoutDashboard },
    { path: '/products', label: 'Produkte', icon: Package },
    { path: '/connections', label: 'Kanäle', icon: Share2 },
    { path: '/sync-history', label: 'Verlauf', icon: Activity },
    { path: '/billing', label: 'Abrechnung', icon: CreditCard },
    { path: '/settings', label: 'Einstellungen', icon: Settings },
  ];

  const handleLogout = async () => {
    await authService.logout();
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 lg:w-64 flex flex-col h-full 
        bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        py-6 px-4
      `}>

        {/* Logo */}
        <div className="mb-8 px-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
              <Package size={20} />
            </div>
            <span className="font-bold text-xl font-serif-display text-slate-900 dark:text-white">ShopMarkets</span>
          </div>

          <button
            onClick={onToggle}
            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>




        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto mb-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${isActive
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* CTA & Socials */}
        <div className="px-2 mb-6 space-y-6">
          {/* CTA Button */}
          <button
            onClick={() => navigate('/products')}
            className="w-full bg-[#5245e5] hover:bg-[#4338ca] text-white py-3.5 px-4 rounded-2xl shadow-[0_8px_20px_-6px_rgba(82,69,229,0.4)] flex items-center justify-center gap-2 transition-all transform active:scale-95 group"
          >
            <span className="font-bold text-[15px]">Produkt hinzufügen</span>
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
          </button>

          {/* Social Icons */}
          <div className="flex justify-center items-center gap-4">
            <a href="#" className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all">
              <Facebook size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all">
              <Twitter size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all">
              <Globe size={18} />
            </a>
          </div>
        </div>

        {/* User Info & Logout */}
        <div className="space-y-4">
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <p className="text-xs text-slate-500 dark:text-slate-400">Angemeldet als</p>
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
              {user?.email || 'User'}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span>Abmelden</span>
          </button>
        </div>
      </div>
    </>
  );
};