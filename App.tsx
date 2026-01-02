import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ProductList } from './components/ProductList';
import { Connections } from './components/Connections';
import { SyncHistory } from './components/SyncHistory';
import { Billing } from './components/Billing';
import { Settings } from './components/Settings';
import { AddProductWizardModal } from './components/AddProductWizardModal';
import { CartDrawer } from './components/CartDrawer';
import { ImportProductsModal } from './components/ImportProductsModal';
import { Bell, Search, ShoppingCart, Menu, MapPin, LayoutDashboard, Package, Share2, Activity, CreditCard, User } from 'lucide-react';
import { MOCK_PRODUCTS, MOCK_CONNECTIONS } from './constants';
import { Product, Connection } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [connections, setConnections] = useState<Connection[]>(MOCK_CONNECTIONS); // Lifted state
  const [credits, setCredits] = useState(100); // Global credits state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  
  // State for editing
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
        // Update existing
        setProducts(products.map(p => p.id === product.id ? product : p));
        setEditingProduct(null);
    } else {
        // Create new
        setProducts([product, ...products]);
    }
    setCurrentView('products');
  };

  const handleAddConnection = (newConnection: Connection) => {
      setConnections(prev => [...prev, newConnection]);
  };

  const handleEditProductClick = (product: Product) => {
      setEditingProduct(product);
      setIsAddProductModalOpen(true);
  };

  const handleCloseWizard = () => {
      setIsAddProductModalOpen(false);
      // Wait for animation to finish before clearing data
      setTimeout(() => setEditingProduct(null), 300);
  };

  const handleImportBatch = (newProducts: Product[]) => {
      setProducts(prev => [...newProducts, ...prev]);
  };

  const handleIncrementStock = (productId: string) => {
    setProducts(products.map(p => {
        if (p.id === productId) {
            return { ...p, stock: p.stock + 1 };
        }
        return p;
    }));
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Möchten Sie dieses Produkt wirklich löschen?')) {
        setProducts(products.filter(p => p.id !== productId));
    }
  };

  const getGermanTitle = (view: string) => {
    switch (view) {
        case 'dashboard': return 'Übersicht';
        case 'products': return 'Inventar';
        case 'connections': return 'Kanäle';
        case 'history': return 'Verlauf';
        case 'billing': return 'Abrechnung';
        case 'settings': return 'Einstellungen';
        default: return view;
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return (
          <ProductList 
            products={products} 
            onAddProduct={() => { setEditingProduct(null); setIsAddProductModalOpen(true); }}
            onEditProduct={handleEditProductClick}
            onImport={() => setIsImportModalOpen(true)}
            onIncrementStock={handleIncrementStock}
            onDeleteProduct={handleDeleteProduct}
          />
        );
      case 'connections':
        return (
            <Connections 
                connections={connections} 
                onAddConnection={handleAddConnection} 
            />
        );
      case 'history':
        return <SyncHistory />;
      case 'billing':
        return <Billing credits={credits} />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <h3 className="text-xl font-display font-medium">Seite nicht gefunden</h3>
          </div>
        );
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Start', icon: LayoutDashboard },
    { id: 'products', label: 'Shop', icon: Package },
    { id: 'connections', label: 'Kanäle', icon: Share2 },
    { id: 'history', label: 'Verlauf', icon: Activity },
    { id: 'settings', label: 'Konto', icon: User },
  ];

  return (
    <div className="flex h-screen bg-[#f8f9fc] dark:bg-[#0b0f19] font-sans text-slate-900 dark:text-slate-100 overflow-hidden">
      
      {/* Cart Drawer Component */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Import Modal */}
      <ImportProductsModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportBatch={handleImportBatch}
        credits={credits}
        onDeductCredits={(amount) => setCredits(prev => Math.max(0, prev - amount))}
      />

      {/* Wizard Modal for New/Edit Product */}
      <AddProductWizardModal 
        isOpen={isAddProductModalOpen}
        onClose={handleCloseWizard}
        onSave={handleSaveProduct}
        initialProduct={editingProduct}
        credits={credits}
        setCredits={setCredits}
        connections={connections} // Pass connections to wizard
      />

      {/* Sidebar (Responsive) */}
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        onAddProduct={() => { setEditingProduct(null); setIsAddProductModalOpen(true); }}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area - The "Bento Box" Container */}
      <div className="flex-1 lg:my-3 lg:mr-3 bg-white/80 dark:bg-[#131b2e]/80 lg:rounded-[2.5rem] lg:border border-white/50 dark:border-white/5 shadow-2xl shadow-indigo-200/20 dark:shadow-black/40 overflow-hidden flex flex-col relative transition-all duration-300 backdrop-blur-xl">
        
        {/* Header - Glassmorphic */}
        <header className="h-20 lg:h-24 flex items-center justify-between px-6 lg:px-10 pt-2 z-20 sticky top-0 lg:static">
          <div className="flex flex-col animate-fade-in-up">
             <div className="hidden lg:flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>ShopMarkets</span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                <span className="capitalize">{getGermanTitle(currentView)}</span>
             </div>
             <h1 className="text-2xl lg:text-4xl font-display font-bold text-slate-900 dark:text-white mt-1 capitalize tracking-tight">
                {getGermanTitle(currentView)}
             </h1>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
             <div className="hidden md:flex items-center gap-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-full px-5 py-2.5 border border-slate-200/50 dark:border-slate-700/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                 <Search className="text-slate-400" size={18} />
                 <input 
                    type="text" 
                    placeholder="Suche..." 
                    className="bg-transparent border-none focus:outline-none text-sm w-24 lg:w-32 text-slate-900 dark:text-slate-200 placeholder-slate-400 font-medium"
                 />
                 <span className="text-slate-300 dark:text-slate-600">|</span>
                 <button 
                    onClick={() => setIsCartOpen(true)}
                    className="relative text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors"
                 >
                    <ShoppingCart size={18} />
                    <div className="w-2 h-2 bg-indigo-500 rounded-full absolute -top-1 -right-1 ring-2 ring-white dark:ring-slate-800 animate-pulse"></div>
                 </button>
             </div>

             {/* Mobile specific header icons */}
             <button className="md:hidden p-2 text-slate-500 dark:text-slate-400">
                <Search size={22} />
             </button>
             <button 
                onClick={() => setIsCartOpen(true)}
                className="md:hidden p-2 text-slate-500 dark:text-slate-400 relative"
             >
                <ShoppingCart size={22} />
                <div className="w-2 h-2 bg-indigo-500 rounded-full absolute top-2 right-1 ring-2 ring-white dark:ring-slate-900"></div>
             </button>

            <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Menu size={20} />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-10 pb-24 lg:pb-10 pt-4 lg:pt-0 scrollbar-hide">
            {renderContent()}
        </main>

        {/* Mobile Bottom Navigation - Fixed Grid Layout */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#0b0f19]/90 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 z-30 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
            <div className="grid grid-cols-5 w-full">
                {navItems.map((item) => {
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.id)}
                      className={`flex flex-col items-center justify-center py-3 transition-all duration-300 relative group ${
                        isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      <div className={`p-1.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-indigo-50 dark:bg-indigo-500/20 -translate-y-1' : 'bg-transparent group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50'}`}>
                        <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                      </div>
                      {isActive && (
                          <div className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400"></div>
                      )}
                    </button>
                  );
                })}
            </div>
        </nav>
      </div>
    </div>
  );
};

export default App;