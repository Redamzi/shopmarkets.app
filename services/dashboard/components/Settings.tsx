import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';
import { User, Bell, Lock, Globe, Moon, ChevronRight, Camera, Mail, Smartphone, Shield, Eye, EyeOff, Check, Laptop } from 'lucide-react';
import { authService } from '../services/authService';

export const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('design');
    const [showPassword, setShowPassword] = useState(false);

    // Profile State
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');

    // Password State
    const [newPassword, setNewPassword] = useState('');
    const [msg, setMsg] = useState('');

    useEffect(() => {
        // Load current user
        authService.getCurrentUser().then(user => {
            if (user) {
                setEmail(user.email || '');
                setFullName(user.user_metadata?.full_name || '');
            }
        });
    }, []);

    const handleUpdatePassword = async () => {
        try {
            setMsg('');
            if (newPassword.length < 6) {
                setMsg('Passwort muss mind. 6 Zeichen haben.');
                return;
            }
            await authService.updatePassword(newPassword);
            setMsg('Passwort erfolgreich geändert!');
            setNewPassword('');
        } catch (err: any) {
            setMsg('Fehler: ' + err.message);
        }
    };

    // Theme State Management via Global Provider
    const { theme, setTheme } = useTheme();

    // Removed local useEffect for theme application as it is handled by ThemeProvider


    const tabs = [
        { id: 'account', icon: User, label: 'Konto', desc: 'Profil & Stammdaten' },
        { id: 'notifications', icon: Bell, label: 'Benachrichtigungen', desc: 'E-Mail & Push' },
        { id: 'security', icon: Lock, label: 'Sicherheit', desc: 'Passwort & 2FA' },
        { id: 'language', icon: Globe, label: 'Sprache & Region', desc: 'Währung & Zone' },
        { id: 'design', icon: Moon, label: 'Design', desc: 'Theme & Ansicht' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'account':
                return (
                    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* Profile Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] lg:rounded-[40px] p-6 lg:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                            <h3 className="text-xl font-bold font-serif-display text-slate-900 dark:text-white mb-6">Profilinformationen</h3>

                            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 text-center md:text-left">
                                <div className="relative group cursor-pointer">
                                    <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden">
                                        <User size={40} />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-slate-900 dark:text-white mt-2 md:mt-0">{fullName || 'Benutzer'}</h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">{email}</p>
                                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-1 rounded-md border border-green-200 dark:border-green-800">Aktiv</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Name</label>
                                    <input type="text" value={fullName} readOnly className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">E-Mail Adresse</label>
                                    <input type="email" value={email} readOnly className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed" />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'notifications':
                return <div className="p-8 text-center text-slate-500">Benachrichtigungs-Einstellungen folgen in Kürze.</div>;
            case 'security':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 lg:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                    <Lock size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold font-serif-display text-slate-900 dark:text-white">Sicherheit</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Passwort & Sicherheitseinstellungen.</p>
                                </div>
                            </div>

                            {/* Password Change */}
                            <div className="mb-10">
                                <h4 className="font-bold text-slate-900 dark:text-white mb-4">Passwort ändern</h4>
                                <div className="grid grid-cols-1 gap-4 max-w-lg">
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Neues Passwort"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white"
                                        />
                                        <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <button onClick={handleUpdatePassword} className="bg-slate-900 dark:bg-indigo-600 text-white font-medium py-3 rounded-2xl hover:bg-slate-800 dark:hover:bg-indigo-700 transition-colors w-full sm:w-auto self-start px-8 justify-center text-center">
                                        Passwort aktualisieren
                                    </button>
                                    {msg && <p className={`text-sm ${msg.includes('Fehler') ? 'text-red-500' : 'text-green-500'}`}>{msg}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'language':
                return <div className="p-8 text-center text-slate-500">Sprach-Einstellungen folgen in Kürze.</div>;
            case 'design':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 lg:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                    <Moon size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold font-serif-display text-slate-900 dark:text-white">Erscheinungsbild</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Passen Sie das Interface an Ihre Vorlieben an.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                {/* Light Mode */}
                                <button onClick={() => setTheme('light')} className={`group relative rounded-2xl border-2 p-1.5 text-left overflow-hidden transition-all duration-300 ${theme === 'light' ? 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/10 dark:bg-indigo-900/10' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700 bg-transparent'}`}>
                                    <div className="bg-slate-50 rounded-xl p-4 mb-3 shadow-sm border border-slate-200 h-28 relative overflow-hidden">
                                        <div className="w-full h-3 bg-white mb-3 rounded-full shadow-sm"></div>
                                        <div className="w-3/4 h-3 bg-white mb-3 rounded-full shadow-sm"></div>
                                    </div>
                                    <div className="px-1 flex items-center justify-between"><span className="font-bold text-sm">Hell</span>{theme === 'light' && <Check size={16} className="text-indigo-600" />}</div>
                                </button>

                                {/* Dark Mode */}
                                <button onClick={() => setTheme('dark')} className={`group relative rounded-2xl border-2 p-1.5 text-left overflow-hidden transition-all duration-300 ${theme === 'dark' ? 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/10 dark:bg-indigo-900/10' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700 bg-transparent'}`}>
                                    <div className="bg-slate-900 rounded-xl p-4 mb-3 shadow-sm border border-slate-800 h-28 relative overflow-hidden">
                                        <div className="w-full h-3 bg-slate-700 mb-3 rounded-full opacity-50"></div>
                                        <div className="w-3/4 h-3 bg-slate-700 mb-3 rounded-full opacity-50"></div>
                                    </div>
                                    <div className="px-1 flex items-center justify-between"><span className="font-bold text-sm">Dunkel</span>{theme === 'dark' && <Check size={16} className="text-indigo-600" />}</div>
                                </button>

                                {/* System Mode */}
                                <button onClick={() => setTheme('system')} className={`group relative rounded-2xl border-2 p-1.5 text-left overflow-hidden transition-all duration-300 ${theme === 'system' ? 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/10 dark:bg-indigo-900/10' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700 bg-transparent'}`}>
                                    <div className="bg-gradient-to-br from-slate-200 to-slate-800 rounded-xl p-4 mb-3 shadow-sm border border-slate-200 dark:border-slate-700 h-28 relative flex items-center justify-center">
                                        <Laptop size={32} className="text-white drop-shadow-md" />
                                    </div>
                                    <div className="px-1 flex items-center justify-between"><span className="font-bold text-sm">System</span>{theme === 'system' && <Check size={16} className="text-indigo-600" />}</div>
                                </button>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="p-6 lg:p-10 w-full mx-auto space-y-6 lg:space-y-8">
            <div>
                <h2 className="text-2xl lg:text-3xl font-bold font-serif-display text-slate-900 dark:text-white">Einstellungen</h2>
                <p className="text-sm lg:text-base text-slate-500 dark:text-slate-400 mt-1">Verwalten Sie Ihre Kontopräferenzen</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 gap-3 lg:space-y-2 lg:gap-0 scrollbar-hide sticky top-6">
                    {tabs.map((item) => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex-shrink-0 w-auto lg:w-full flex items-center gap-4 p-3 lg:p-4 rounded-2xl transition-all text-left group ${activeTab === item.id ? 'bg-white dark:bg-slate-900 shadow-lg text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
                            <item.icon size={20} />
                            <span className="hidden lg:block font-bold text-sm">{item.label}</span>
                        </button>
                    ))}
                </div>
                <div className="lg:col-span-2">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};