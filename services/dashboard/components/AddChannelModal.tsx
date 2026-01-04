import React, { useState, useEffect } from 'react';
import { X, Search, Check, ShoppingBag, Store, ShoppingCart, Layers, Box, Globe, Loader2, Lock, ArrowRight, ShieldCheck, Key, AlertTriangle, HelpCircle, Info, ExternalLink, Settings, Facebook, Instagram, Twitter, Video, Truck, Tag, FileText, Receipt, Layout, Sparkles } from 'lucide-react';
import { Platform } from '../types';

interface AddChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (channel: any) => void;
}

const AVAILABLE_CHANNELS = [
  // Native Channel - Fixed at Top
  { 
      id: 'shopmarkets', 
      label: 'ShopMarkets Storefront', 
      sub: 'Ihr eigener Onlineshop', 
      icon: Layout, 
      color: 'text-indigo-600 dark:text-indigo-400', 
      bg: 'bg-indigo-50 dark:bg-indigo-900/30',
      isNative: true 
  },
  { id: 'shopify', label: 'Shopify', sub: 'Global', icon: ShoppingBag, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30' },
  { id: 'woocommerce', label: 'WooCommerce', sub: 'Global', icon: Store, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
  { id: 'tiktok', label: 'TikTok Shop', sub: 'Social Commerce', icon: Video, color: 'text-slate-900 dark:text-white', bg: 'bg-cyan-50 dark:bg-cyan-900/30' },
  { id: 'instagram', label: 'Instagram', sub: 'Meta Commerce', icon: Instagram, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-900/30' },
  { id: 'facebook', label: 'Facebook Shop', sub: 'Meta Commerce', icon: Facebook, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
  { id: 'amazon', label: 'Amazon EU', sub: 'DE, UK, FR, IT, ES', icon: ShoppingCart, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/30' },
  { id: 'ebay', label: 'eBay EU', sub: 'DE, UK, FR, IT, ES', icon: ShoppingBag, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
  { id: 'x', label: 'X Shopping', sub: 'Social', icon: Twitter, color: 'text-slate-900 dark:text-white', bg: 'bg-slate-100 dark:bg-slate-800' },
  { id: 'etsy', label: 'Etsy', sub: 'Handmade', icon: Store, color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  { id: 'shopware', label: 'Shopware', sub: 'DACH Leader', icon: Layers, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
  { id: 'magento', label: 'Magento', sub: 'Enterprise', icon: Layers, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/30' },
  { id: 'prestashop', label: 'PrestaShop', sub: 'Open Source', icon: ShoppingCart, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-900/30' },
  { id: 'oxid', label: 'Oxid', sub: 'Enterprise', icon: Box, color: 'text-green-700 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
  { id: 'bol', label: 'Bol.com', sub: 'NL, BE', icon: Globe, color: 'text-blue-800 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
];

export const AddChannelModal: React.FC<AddChannelModalProps> = ({ isOpen, onClose, onConnect }) => {
  const [step, setStep] = useState(1);
  const [selectedChannel, setSelectedChannel] = useState<typeof AVAILABLE_CHANNELS[0] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Checklist state for Step 3 animation
  const [checklist, setChecklist] = useState([
    { id: 'auth', label: 'Verbindung autorisieren', status: 'waiting', icon: Key }, 
    { id: 'vars', label: 'Globale Einstellungen & Währungen', status: 'waiting', icon: Globe },
    { id: 'cats', label: 'Shop-Kategorien synchronisieren', status: 'waiting', icon: Layers },
    { id: 'attrs', label: 'Attribute & Varianten mappen', status: 'waiting', icon: Tag },
    { id: 'shipping', label: 'Versandprofile importieren', status: 'waiting', icon: Truck },
    { id: 'orders', label: 'Bestellungen abgleichen (Inventar)', status: 'waiting', icon: Receipt },
  ]);

  const [allDone, setAllDone] = useState(false);
  
  // Auth Form State
  const [authData, setAuthData] = useState({
    url: '',
    apiKey: '',
    apiSecret: '',
    shopName: '',
    marketplace: 'DE',
    username: ''
  });

  // Reset checklist when modal opens or step changes
  useEffect(() => {
      if (step === 1) {
          setChecklist(prev => prev.map(item => ({ ...item, status: 'waiting' })));
          setAllDone(false);
      }
  }, [step, isOpen]);

  // Animation effect for Step 3
  useEffect(() => {
      if (step === 3 && isOpen) {
          let currentStep = 0;
          
          const runStep = () => {
              if (currentStep >= checklist.length) {
                  setAllDone(true);
                  return;
              }

              // Set current to loading
              setChecklist(prev => prev.map((item, idx) => 
                  idx === currentStep ? { ...item, status: 'loading' } : item
              ));

              // Wait random time between 400-800ms
              const timeout = Math.floor(Math.random() * 400) + 400;

              setTimeout(() => {
                  // Set current to done
                  setChecklist(prev => prev.map((item, idx) => 
                      idx === currentStep ? { ...item, status: 'done' } : item
                  ));
                  currentStep++;
                  runStep();
              }, timeout);
          };

          // Slight initial delay
          setTimeout(runStep, 500);
      }
  }, [step, isOpen]);


  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1 && selectedChannel) {
      setStep(2);
    } else if (step === 2) {
      setIsLoading(true);
      // Simulate API Connection handshake
      setTimeout(() => {
        setIsLoading(false);
        setStep(3);
      }, 1500);
    } else if (step === 3) {
        let finalUrl = authData.url;
        if (selectedChannel?.id === 'shopmarkets') {
            finalUrl = authData.shopName ? `${authData.shopName}.shop-markets.com` : 'mein-shop.shop-markets.com';
        } else if (selectedChannel?.id === 'amazon') {
            finalUrl = `Amazon ${authData.marketplace}`;
        } else if (!finalUrl) {
            finalUrl = `${selectedChannel?.id}-shop.com`;
        }

      onConnect({
        id: `conn_${Date.now()}`,
        platform: selectedChannel?.id,
        name: selectedChannel?.label,
        url: finalUrl,
        status: 'active',
        lastSyncAt: 'Gerade eben'
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedChannel(null);
    setAuthData({ url: '', apiKey: '', apiSecret: '', shopName: '', marketplace: 'DE', username: '' });
    onClose();
  };

  const filteredChannels = AVAILABLE_CHANNELS.filter(c => 
    c.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAmazonTld = (marketplace: string) => {
      switch(marketplace) {
          case 'UK': return 'co.uk';
          case 'DE': return 'de';
          case 'FR': return 'fr';
          case 'IT': return 'it';
          case 'ES': return 'es';
          case 'NL': return 'nl';
          case 'PL': return 'pl';
          case 'SE': return 'se';
          default: return 'de';
      }
  };

  const InfoBox = ({ title, text, link, linkText }: { title: string, text: string, link?: string, linkText?: string }) => (
    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex gap-3 items-start mt-4">
        <div className="mt-0.5 text-blue-600 dark:text-blue-400 shrink-0"><Info size={18} /></div>
        <div className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed w-full">
            <p className="font-bold mb-1">{title}</p>
            <p className="mb-2 text-blue-800 dark:text-blue-300">{text}</p>
            {link && (
                <a 
                    href={link}
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors shadow-sm mt-1"
                >
                    {linkText || "Zur Hilfe öffnen"} <ExternalLink size={12} />
                </a>
            )}
        </div>
    </div>
  );

  const renderAuthFields = () => {
    switch (selectedChannel?.id) {
      case 'shopmarkets':
          return (
            <div className="space-y-6">
                 <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-800 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm mb-3">
                        <Sparkles size={24} />
                    </div>
                    <h4 className="font-bold text-indigo-900 dark:text-indigo-200">Native Integration</h4>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                        Dies ist Ihr nativer ShopMarkets Storefront. Es sind keine API-Schlüssel oder Mappings erforderlich. Wir verwenden automatisch Ihre Standard-Variablen.
                    </p>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">Wählen Sie Ihre Subdomain</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="mein-brand"
                            className="w-full pl-5 pr-40 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white font-medium"
                            value={authData.shopName}
                            onChange={e => setAuthData({...authData, shopName: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">.shop-markets.com</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 ml-1 flex items-center gap-1">
                        <Check size={12} className="text-green-500" /> 
                        SSL-Zertifikat inklusive
                    </p>
                </div>
            </div>
          );

      case 'shopify':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Shop Domain</label>
              <div className="relative">
                 <input 
                  type="text" 
                  placeholder="mein-shop"
                  className="w-full pl-5 pr-32 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
                  value={authData.shopName}
                  onChange={e => setAuthData({...authData, shopName: e.target.value})}
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">.myshopify.com</span>
              </div>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl flex gap-3 items-start border border-indigo-100 dark:border-indigo-800">
               <Lock className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" size={18} />
               <p className="text-sm text-indigo-900 dark:text-indigo-200">Wir leiten Sie zu Shopify weiter, um die Verbindung sicher via OAuth zu bestätigen.</p>
            </div>
          </div>
        );

      case 'woocommerce':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">WordPress URL</label>
              <input 
                type="text" 
                placeholder="https://mein-shop.de"
                className="w-full px-5 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white"
                value={authData.url}
                onChange={e => setAuthData({...authData, url: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Consumer Key</label>
              <input 
                type="text" 
                placeholder="ck_xxxxxxxxxxxxxxxx"
                className="w-full px-5 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-sm text-slate-900 dark:text-white"
                value={authData.apiKey}
                onChange={e => setAuthData({...authData, apiKey: e.target.value})}
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Consumer Secret</label>
              <input 
                type="password" 
                placeholder="cs_xxxxxxxxxxxxxxxx"
                className="w-full px-5 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-sm text-slate-900 dark:text-white"
                value={authData.apiSecret}
                onChange={e => setAuthData({...authData, apiSecret: e.target.value})}
              />
            </div>
            <InfoBox 
                title="API-Daten finden"
                text='Gehen Sie in Ihrem WordPress-Backend zu: WooCommerce > Einstellungen > Erweitert > REST API. Klicken Sie auf "Schlüssel hinzufügen".'
            />
          </div>
        );

      case 'amazon':
        return (
           <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Primärer Marktplatz</label>
               <div className="relative">
                 <select 
                    className="w-full px-5 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none text-slate-900 dark:text-white"
                    value={authData.marketplace}
                    onChange={e => setAuthData({...authData, marketplace: e.target.value})}
                 >
                    <option value="DE">Amazon.de (Deutschland)</option>
                    <option value="UK">Amazon.co.uk (Vereinigtes Königreich)</option>
                    <option value="FR">Amazon.fr (Frankreich)</option>
                    <option value="IT">Amazon.it (Italien)</option>
                    <option value="ES">Amazon.es (Spanien)</option>
                    <option value="NL">Amazon.nl (Niederlande)</option>
                 </select>
                 <ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" size={16} />
               </div>
             </div>

             <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Seller ID (Merchant Token)</label>
              <input 
                type="text" 
                placeholder="A21TJ7..."
                className="w-full px-5 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-sm text-slate-900 dark:text-white"
                value={authData.apiKey}
                onChange={e => setAuthData({...authData, apiKey: e.target.value})}
              />
            </div>
             <div>
              <div className="flex justify-between items-center mb-1 ml-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">MWS Auth Token</label>
                  <a 
                    href="https://sellercentral.amazon.de/help/hub/reference/external/G201852750" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                  >
                      <HelpCircle size={10} />
                      Wo finde ich das?
                  </a>
              </div>
              <input 
                type="password" 
                placeholder="amzn.mws...."
                className="w-full px-5 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-sm text-slate-900 dark:text-white"
                value={authData.apiSecret}
                onChange={e => setAuthData({...authData, apiSecret: e.target.value})}
              />
            </div>
            <InfoBox 
                title="Verbindung herstellen"
                text='Gehen Sie zu "Apps & Services" im Seller Central und autorisieren Sie ShopMarkets. Kopieren Sie anschließend den Token hierher.'
                link={`https://sellercentral.amazon.${getAmazonTld(authData.marketplace)}/apps/manage`}
                linkText="Zum Seller Central"
            />
           </div>
        );

      case 'ebay':
        return (
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">eBay Marktplatz</label>
                    <div className="relative">
                        <select 
                            className="w-full px-5 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none text-slate-900 dark:text-white"
                            value={authData.marketplace}
                            onChange={e => setAuthData({...authData, marketplace: e.target.value})}
                        >
                            <option value="DE">eBay.de (Deutschland)</option>
                            <option value="UK">eBay.co.uk (Vereinigtes Königreich)</option>
                            <option value="FR">eBay.fr (Frankreich)</option>
                            <option value="IT">eBay.it (Italien)</option>
                            <option value="ES">eBay.es (Spanien)</option>
                        </select>
                        <ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" size={16} />
                    </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-3 items-start border border-blue-100 dark:border-blue-800">
                    <ShieldCheck className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" size={18} />
                    <div>
                        <p className="font-bold text-sm text-blue-900 dark:text-blue-200 mb-1">eBay OAuth Login</p>
                        <p className="text-sm text-blue-800 dark:text-blue-300">Wir leiten Sie sicher zu eBay weiter, um den Zugriff zu gewähren. Sie benötigen keine manuellen API-Schlüssel.</p>
                    </div>
                </div>
            </div>
        );

      default:
        return (
          <div className="space-y-4">
             <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">API URL</label>
              <input 
                type="text" 
                className="w-full px-5 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white"
                value={authData.url}
                onChange={e => setAuthData({...authData, url: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">API Key</label>
              <input 
                type="password" 
                className="w-full px-5 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white"
                value={authData.apiKey}
                onChange={e => setAuthData({...authData, apiKey: e.target.value})}
              />
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl flex gap-3 items-center">
                <Settings size={18} className="text-slate-500 dark:text-slate-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Bitte konsultieren Sie die API-Dokumentation Ihres Anbieters.</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-none md:rounded-[32px] shadow-2xl overflow-hidden flex flex-col h-full md:h-auto md:max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>1</span>
              <div className={`w-8 h-0.5 rounded ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
              <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>2</span>
              <div className={`w-8 h-0.5 rounded ${step >= 3 ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
              <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>3</span>
            </div>
            <h2 className="text-2xl font-bold font-serif-display text-slate-900 dark:text-white">
              {step === 1 ? 'Kanal auswählen' : step === 2 ? (selectedChannel?.id === 'shopmarkets' ? 'Shop konfigurieren' : 'Authentifizierung') : 'Verbindung hergestellt'}
            </h2>
          </div>
          <button 
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-slate-50/50 dark:bg-slate-800/50">
          
          {/* STEP 1: SELECT CHANNEL */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Suchen Sie nach Marktplätzen oder Shopsystemen..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white placeholder-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
                {filteredChannels.map(channel => (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group hover:shadow-md ${
                      selectedChannel?.id === channel.id 
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-600 ring-1 ring-indigo-600' 
                      : (channel as any).isNative 
                        ? 'bg-indigo-50/20 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${channel.bg} ${channel.color} group-hover:scale-110 transition-transform`}>
                      <channel.icon size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 dark:text-white truncate">{channel.label}</h4>
                          {(channel as any).isNative && (
                              <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Native</span>
                          )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{channel.sub}</p>
                    </div>
                    {selectedChannel?.id === channel.id && (
                      <div className="ml-auto w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white animate-in zoom-in shrink-0">
                        <Check size={14} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: AUTH */}
          {step === 2 && selectedChannel && (
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-4 ${selectedChannel.bg} ${selectedChannel.color} shadow-lg shadow-indigo-100 dark:shadow-none`}>
                  <selectedChannel.icon size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Verbinde {selectedChannel.label}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    {selectedChannel.id === 'shopmarkets' 
                        ? 'Richten Sie Ihren persönlichen Storefront ein.' 
                        : 'Geben Sie Ihre Zugangsdaten ein, um den Sync zu starten.'
                    }
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                {renderAuthFields()}
              </div>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                <Lock size={12} />
                <span>Ihre Daten werden verschlüsselt übertragen (AES-256).</span>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS & CHECKLIST */}
          {step === 3 && selectedChannel && (
            <div className="flex flex-col items-center justify-center text-center h-full py-2">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-4 animate-in zoom-in duration-300">
                <Check size={40} strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-bold font-serif-display text-slate-900 dark:text-white mb-2">Erfolgreich verbunden!</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6 text-sm">
                <span className="font-bold text-slate-900 dark:text-white">{selectedChannel.label}</span> wurde hinzugefügt. Wir importieren jetzt Ihre Daten.
              </p>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 w-full max-w-md border border-slate-200 dark:border-slate-700 text-left">
                  {checklist.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 py-2 border-b border-slate-50 dark:border-slate-700/50 last:border-0 last:pb-0">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                              item.status === 'done' ? 'bg-green-500 text-white' : 
                              item.status === 'loading' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600' : 
                              'bg-slate-100 dark:bg-slate-700 text-slate-300 dark:text-slate-500'
                          }`}>
                              {item.status === 'done' ? <Check size={14} /> : 
                               item.status === 'loading' ? <Loader2 size={14} className="animate-spin" /> : 
                               <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-500" />}
                          </div>
                          <div className="flex-1">
                              <p className={`text-sm font-medium transition-colors ${
                                  item.status === 'done' ? 'text-slate-800 dark:text-slate-200' :
                                  item.status === 'loading' ? 'text-indigo-600 dark:text-indigo-400' :
                                  'text-slate-400 dark:text-slate-600'
                              }`}>
                                  {item.label}
                              </p>
                          </div>
                          {item.status !== 'waiting' && <item.icon size={14} className={item.status === 'done' ? 'text-green-500' : 'text-indigo-500'} />}
                      </div>
                  ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 flex justify-between items-center">
          {step > 1 ? (
             <button 
              onClick={() => step === 2 ? setStep(1) : handleClose()}
              className="px-6 py-3 rounded-xl font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors justify-center text-center"
              disabled={isLoading || (step === 3 && !allDone)}
            >
              {step === 3 ? 'Schließen' : 'Zurück'}
            </button>
          ) : (
             <div></div> 
          )}

          <button 
            onClick={handleNext}
            disabled={(step === 1 && !selectedChannel) || isLoading || (step === 3 && !allDone)}
            className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2 justify-center text-center ${
              (step === 1 && !selectedChannel) || (step === 3 && !allDone)
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none' 
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30 hover:-translate-y-0.5'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                {selectedChannel?.id === 'shopmarkets' ? 'Shop erstellen...' : 'Verbinde...'}
              </>
            ) : step === 3 ? (
              <>
                <Check size={20} />
                Abschließen
              </>
            ) : (
              <>
                {step === 2 && (selectedChannel?.id === 'shopify' || selectedChannel?.id === 'ebay' || selectedChannel?.id === 'facebook' || selectedChannel?.id === 'instagram')
                  ? `Weiter zu ${selectedChannel.label}` 
                  : step === 2 
                  ? (selectedChannel?.id === 'shopmarkets' ? 'Shop aktivieren' : 'Verbinden')
                  : 'Weiter'
                }
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};