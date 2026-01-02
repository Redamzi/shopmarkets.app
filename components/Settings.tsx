import React, { useState, useEffect } from 'react';
import { User, Bell, Lock, Globe, Moon, ChevronRight, Camera, Mail, Smartphone, Shield, Eye, EyeOff, Check, Laptop, Sun } from 'lucide-react';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('design'); 
  const [showPassword, setShowPassword] = useState(false);
  
  // Theme State Management
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    if (typeof window !== 'undefined') {
        return (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
    }
    return 'system';
  });

  // Apply Theme Effect
  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
        root.classList.remove('light', 'dark');
        
        if (theme === 'system') {
            if (mediaQuery.matches) {
                root.classList.add('dark');
            } else {
                root.classList.add('light');
            }
        } else {
            root.classList.add(theme);
        }
    };

    applyTheme();
    localStorage.setItem('theme', theme);

    // Listen for system changes if in system mode
    if (theme === 'system') {
        mediaQuery.addEventListener('change', applyTheme);
        return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [theme]);


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
                                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                    <Camera size={20} />
                                </div>
                                <button className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white border-2 border-white dark:border-slate-800 shadow-md hover:bg-indigo-700 transition-colors">
                                    <Camera size={14} />
                                </button>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-slate-900 dark:text-white mt-2 md:mt-0">Acme GmbH</h4>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">Professional Paket</p>
                                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-1 rounded-md border border-green-200 dark:border-green-800">Verifiziert</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Firmenname</label>
                                <input type="text" defaultValue="Acme GmbH" className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">E-Mail Adresse</label>
                                <input type="email" defaultValue="admin@acme.com" className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Telefonnummer</label>
                                <input type="tel" defaultValue="+49 123 456789" className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Standort</label>
                                <input type="text" defaultValue="Berlin, Deutschland" className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white" />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button className="w-full md:w-auto px-8 py-3 bg-slate-900 dark:bg-indigo-600 text-white rounded-full font-medium hover:bg-slate-800 dark:hover:bg-indigo-700 transition-colors shadow-lg shadow-slate-900/10 justify-center text-center">
                                Änderungen speichern
                            </button>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="p-6 rounded-[32px] border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
                        <h4 className="text-red-700 dark:text-red-400 font-bold mb-2">Konto löschen</h4>
                        <p className="text-sm text-red-600/80 dark:text-red-400/70 mb-4">Möchten Sie Ihr Konto und alle damit verbundenen Daten unwiderruflich löschen?</p>
                        <button className="text-sm font-bold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors justify-center text-center">
                            Konto löschen
                        </button>
                    </div>
                </div>
            );
        case 'notifications':
            return (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 lg:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                         <div className="flex items-center gap-4 mb-8">
                             <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                 <Bell size={24} />
                             </div>
                             <div>
                                 <h3 className="text-xl font-bold font-serif-display text-slate-900 dark:text-white">Benachrichtigungen</h3>
                                 <p className="text-slate-500 dark:text-slate-400 text-sm">Bestimmen Sie, wie und wann wir Sie kontaktieren.</p>
                             </div>
                         </div>

                         <div className="space-y-8">
                             {/* Group 1 */}
                             <div>
                                 <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Bestellungen & Sync</h4>
                                 <div className="space-y-4">
                                     {[
                                         { label: 'Fehlgeschlagene Synchronisationen', desc: 'Sofortige Benachrichtigung bei API-Fehlern', email: true, push: true },
                                         { label: 'Niedriger Lagerbestand', desc: 'Warnung wenn Bestand unter 5 fällt', email: true, push: false },
                                         { label: 'Erfolgreiche Exporte', desc: 'Wöchentliche Zusammenfassung der Aktivitäten', email: false, push: false },
                                     ].map((item, idx) => (
                                         <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                             <div className="flex-1">
                                                 <p className="font-bold text-slate-900 dark:text-white">{item.label}</p>
                                                 <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                                             </div>
                                             <div className="flex gap-3">
                                                 <button className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${item.email ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                                                     <Mail size={14} /> E-Mail
                                                 </button>
                                                 <button className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${item.push ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                                                     <Smartphone size={14} /> Push
                                                 </button>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             </div>

                             {/* Group 2 */}
                             <div>
                                 <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Konto & Sicherheit</h4>
                                 <div className="space-y-4">
                                     {[
                                         { label: 'Neue Anmeldungen', desc: 'Benachrichtigung bei Login von neuem Gerät', email: true, push: true },
                                         { label: 'Rechnungen', desc: 'Monatliche Rechnungen per E-Mail senden', email: true, push: false },
                                     ].map((item, idx) => (
                                         <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                             <div className="flex-1">
                                                 <p className="font-bold text-slate-900 dark:text-white">{item.label}</p>
                                                 <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                                             </div>
                                             <div className="flex gap-3">
                                                 <button className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${item.email ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                                                     <Mail size={14} /> E-Mail
                                                 </button>
                                                 <button className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${item.push ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                                                     <Smartphone size={14} /> Push
                                                 </button>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>
            );
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
                                 <p className="text-slate-500 dark:text-slate-400 text-sm">Schützen Sie Ihr Konto und Ihre Daten.</p>
                             </div>
                         </div>

                         {/* Password Change */}
                         <div className="mb-10">
                             <h4 className="font-bold text-slate-900 dark:text-white mb-4">Passwort ändern</h4>
                             <div className="grid grid-cols-1 gap-4 max-w-lg">
                                 <div className="relative">
                                     <input type={showPassword ? "text" : "password"} placeholder="Aktuelles Passwort" className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white" />
                                 </div>
                                 <div className="relative">
                                     <input type={showPassword ? "text" : "password"} placeholder="Neues Passwort" className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white" />
                                     <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                         {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                     </button>
                                 </div>
                                 <button className="bg-slate-900 dark:bg-indigo-600 text-white font-medium py-3 rounded-2xl hover:bg-slate-800 dark:hover:bg-indigo-700 transition-colors w-full sm:w-auto self-start px-8 justify-center text-center">
                                     Passwort aktualisieren
                                 </button>
                             </div>
                         </div>

                         {/* 2FA */}
                         <div className="p-6 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                             <div className="flex gap-4">
                                 <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm shrink-0">
                                     <Shield size={24} />
                                 </div>
                                 <div>
                                     <h4 className="font-bold text-indigo-900 dark:text-indigo-200 text-lg">Zwei-Faktor-Authentifizierung (2FA)</h4>
                                     <p className="text-sm text-indigo-700/80 dark:text-indigo-300/80 mt-1 max-w-md">Fügen Sie eine zusätzliche Sicherheitsebene hinzu, indem Sie bei der Anmeldung einen Code von Ihrem Mobilgerät verlangen.</p>
                                 </div>
                             </div>
                             <div className="w-full md:w-auto">
                                 <button className="w-full md:w-auto bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 justify-center text-center">
                                     2FA Aktivieren
                                 </button>
                             </div>
                         </div>
                    </div>
                </div>
            );
        case 'language':
            return (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                     <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 lg:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4 mb-8">
                             <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                 <Globe size={24} />
                             </div>
                             <div>
                                 <h3 className="text-xl font-bold font-serif-display text-slate-900 dark:text-white">Sprache & Region</h3>
                                 <p className="text-slate-500 dark:text-slate-400 text-sm">Lokalisierungseinstellungen für Ihr Dashboard.</p>
                             </div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">Anzeigesprache</label>
                                 <select className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none font-medium text-slate-700 dark:text-white">
                                     <option>Deutsch</option>
                                     <option>English (US)</option>
                                     <option>Français</option>
                                     <option>Español</option>
                                 </select>
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">Währung</label>
                                 <select className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none font-medium text-slate-700 dark:text-white">
                                     <option>Euro (€)</option>
                                     <option>US Dollar ($)</option>
                                     <option>British Pound (£)</option>
                                     <option>Swiss Franc (CHF)</option>
                                 </select>
                             </div>
                             <div className="md:col-span-2">
                                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">Zeitzone</label>
                                 <select className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none font-medium text-slate-700 dark:text-white">
                                     <option>(GMT+01:00) Berlin, Amsterdam, Rom, Stockholm, Wien</option>
                                     <option>(GMT+00:00) London, Dublin, Lissabon</option>
                                     <option>(GMT-05:00) Eastern Time (US & Canada)</option>
                                 </select>
                             </div>
                         </div>
                     </div>
                </div>
            );
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
                             <button 
                                onClick={() => setTheme('light')}
                                className={`group relative rounded-2xl border-2 p-1.5 text-left overflow-hidden transition-all duration-300 ${
                                    theme === 'light' 
                                    ? 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/10 dark:bg-indigo-900/10' 
                                    : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700 bg-transparent'
                                }`}
                             >
                                 <div className="bg-slate-50 rounded-xl p-4 mb-3 shadow-sm border border-slate-200 h-28 relative overflow-hidden">
                                     <div className="w-full h-3 bg-white mb-3 rounded-full shadow-sm"></div>
                                     <div className="w-3/4 h-3 bg-white mb-3 rounded-full shadow-sm"></div>
                                     <div className="absolute right-3 bottom-3 w-8 h-8 bg-indigo-100 rounded-full"></div>
                                 </div>
                                 <div className="px-1 flex items-center justify-between">
                                     <span className={`font-bold text-sm ${theme === 'light' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-slate-300'}`}>Hell</span>
                                     {theme === 'light' && (
                                         <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white animate-in zoom-in">
                                             <Check size={12} strokeWidth={3} />
                                         </div>
                                     )}
                                 </div>
                             </button>

                             {/* Dark Mode */}
                             <button 
                                onClick={() => setTheme('dark')}
                                className={`group relative rounded-2xl border-2 p-1.5 text-left overflow-hidden transition-all duration-300 ${
                                    theme === 'dark' 
                                    ? 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/10 dark:bg-indigo-900/10' 
                                    : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700 bg-transparent'
                                }`}
                             >
                                 <div className="bg-slate-900 rounded-xl p-4 mb-3 shadow-sm border border-slate-800 h-28 relative overflow-hidden">
                                     <div className="w-full h-3 bg-slate-700 mb-3 rounded-full opacity-50"></div>
                                     <div className="w-3/4 h-3 bg-slate-700 mb-3 rounded-full opacity-50"></div>
                                     <div className="absolute right-3 bottom-3 w-8 h-8 bg-indigo-600/80 rounded-full"></div>
                                 </div>
                                 <div className="px-1 flex items-center justify-between">
                                     <span className={`font-bold text-sm ${theme === 'dark' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>Dunkel</span>
                                     {theme === 'dark' && (
                                         <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white animate-in zoom-in">
                                             <Check size={12} strokeWidth={3} />
                                         </div>
                                     )}
                                 </div>
                             </button>

                             {/* System Mode */}
                             <button 
                                onClick={() => setTheme('system')}
                                className={`group relative rounded-2xl border-2 p-1.5 text-left overflow-hidden transition-all duration-300 ${
                                    theme === 'system' 
                                    ? 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/10 dark:bg-indigo-900/10' 
                                    : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700 bg-transparent'
                                }`}
                             >
                                 <div className="bg-gradient-to-br from-slate-200 to-slate-800 rounded-xl p-4 mb-3 shadow-sm border border-slate-200 dark:border-slate-700 h-28 relative overflow-hidden flex items-center justify-center">
                                     <Laptop size={32} className="text-white drop-shadow-md" />
                                 </div>
                                 <div className="px-1 flex items-center justify-between">
                                     <span className={`font-bold text-sm ${theme === 'system' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>System</span>
                                     {theme === 'system' && (
                                         <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white animate-in zoom-in">
                                             <Check size={12} strokeWidth={3} />
                                         </div>
                                     )}
                                 </div>
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
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold font-serif-display text-slate-900 dark:text-white">Einstellungen</h2>
        <p className="text-sm lg:text-base text-slate-500 dark:text-slate-400 mt-1">Verwalten Sie Ihre Kontopräferenzen</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Sidebar Navigation for Settings */}
          <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 gap-3 lg:space-y-2 lg:gap-0 scrollbar-hide sticky top-6">
              {tabs.map((item) => (
                  <button 
                    key={item.id} 
                    onClick={() => setActiveTab(item.id)}
                    className={`flex-shrink-0 w-auto lg:w-full flex items-center gap-4 p-3 lg:p-4 rounded-2xl transition-all text-left group ${
                      activeTab === item.id
                        ? 'bg-white dark:bg-slate-900 shadow-lg shadow-slate-200/50 dark:shadow-black/20 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-50 dark:ring-slate-800 relative z-10' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${activeTab === item.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700'}`}>
                          <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                      </div>
                      <div className="hidden lg:block">
                          <span className={`block font-bold text-sm ${activeTab === item.id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{item.label}</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{item.desc}</span>
                      </div>
                      {/* Mobile Label only */}
                      <span className="block lg:hidden font-bold text-sm whitespace-nowrap">{item.label}</span>
                      
                      {activeTab === item.id && <ChevronRight size={16} className="hidden lg:block ml-auto text-indigo-400" />}
                  </button>
              ))}
          </div>

          {/* Main Form Area */}
          <div className="lg:col-span-2">
              {renderContent()}
          </div>
      </div>
    </div>
  );
};