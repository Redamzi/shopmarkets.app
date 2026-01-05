import React, { useState } from 'react';
import { Bell, Search, Menu, User, LogOut, Settings as SettingsIcon, Plus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface HeaderProps {
    onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const handleLogout = async () => {
        await authService.logout();
        logout();
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 lg:px-6">
            <div className="flex items-center justify-between">

                {/* Left: Mobile Menu & Search */}
                <div className="flex items-center gap-4 flex-1">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                    >
                        <Menu size={20} />
                    </button>

                    <div className="hidden md:flex items-center max-w-md w-full relative">
                        <Search className="absolute left-3 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Suche..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-900 dark:text-white"
                        />
                    </div>
                </div>

                {/* Right: Actions & Profile */}
                <div className="flex items-center gap-3 md:gap-4">
                    <button
                        onClick={() => navigate('/products')}
                        className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#5245e5] hover:bg-[#4338ca] text-white rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
                    >
                        <span className="font-bold text-sm">Produkt hinzufügen</span>
                        <Plus size={18} strokeWidth={2.5} />
                    </button>

                    <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl relative">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-3 p-1 pr-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-800 transition-all"
                        >
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <User size={16} />
                            </div>
                            <span className="hidden md:block text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
                                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                            </span>
                        </button>

                        {/* Dropdown */}
                        {showProfileMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)}></div>
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-20 animate-in fade-in zoom-in-95">
                                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Mein Account</p>
                                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                    </div>
                                    <button onClick={() => navigate('/settings')} className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                                        <SettingsIcon size={16} /> Einstellungen
                                    </button>
                                    <div className="my-1 border-t border-slate-100 dark:border-slate-800"></div>
                                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2">
                                        <LogOut size={16} /> Abmelden
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
