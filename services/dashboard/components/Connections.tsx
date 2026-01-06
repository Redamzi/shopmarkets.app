import React, { useEffect, useState } from 'react';
import { Share2, Plus, RefreshCw, Trash2, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { connectionService, Connection } from '../services/connectionService';
import { useAuthStore } from '../store/authStore';
import { AddChannelModal } from './AddChannelModal';
import { ConnectionWizard } from './ConnectionWizard';

// Mock integrations available to add
interface Integration {
    id: string;
    name: string;
    description: string;
    icon: string;
    type: 'shop' | 'marketplace' | 'marketing';
}

const INTEGRATIONS: Integration[] = [
    { id: 'shopify', name: 'Shopify', description: 'Produkte & Bestellungen syncen', icon: 'https://cdn.iconscout.com/icon/free/png-256/free-shopify-logo-icon-download-in-svg-png-gif-file-formats--shops-brand-brands-pack-logos-icons-226579.png?f=webp&w=256', type: 'shop' },
    { id: 'woocommerce', name: 'WooCommerce', description: 'WordPress Shop Integration', icon: 'https://cdn.iconscout.com/icon/free/png-256/free-woocommerce-logo-icon-download-in-svg-png-gif-file-formats--brand-development-tools-pack-logos-icons-226066.png?f=webp&w=256', type: 'shop' },
    { id: 'amazon', name: 'Amazon Seller', description: 'FBA & FBM Bestellungen', icon: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg', type: 'marketplace' },
    { id: 'kaufland', name: 'Kaufland', description: 'Marktplatz Anbindung', icon: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Kaufland_Logo.svg', type: 'marketplace' },
    { id: 'meta', name: 'Meta / Facebook', description: 'Social Commerce & Ads', icon: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png', type: 'marketing' },
];

export const Connections: React.FC = () => {
    const [connections, setConnections] = useState<Connection[]>([]);
    const [loading, setLoading] = useState(true);

    // Wizard State
    const [connecting, setConnecting] = useState<string | null>(null);
    const [wizardOpen, setWizardOpen] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState('');

    // Manual Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { user } = useAuthStore();

    const loadData = async () => {
        setLoading(true);
        const data = await connectionService.getConnections();
        setConnections(data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAddChannel = async (channelData: any) => {
        if (!user) return;

        // channelData contains platform, shopUrl etc.
        const newConnection: Connection = {
            platform: channelData.id || selectedPlatform.toLowerCase(),
            shop_url: channelData.shopUrl || '',
            api_key: 'connected',
            status: 'active',
            user_id: user.id
        };

        try {
            await connectionService.addConnection(newConnection);
            loadData();
            setWizardOpen(false);
            setIsModalOpen(false);
            alert('Verbindung erfolgreich gespeichert!');
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.error || err.message || 'Unbekannter Fehler';
            alert(`Fehler beim Verbinden: ${msg}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Verbindung wirklich löschen?')) {
            await connectionService.deleteConnection(id);
            loadData();
        }
    };

    // Triggered when clicking "Verbinden" on a card
    const handleConnectClick = (platform: string) => {
        setConnecting(platform);
        // Simulate API delay/auth redirect start
        setTimeout(() => {
            setConnecting(null);
            setSelectedPlatform(platform);
            setWizardOpen(true);
        }, 800);
    };

    return (
        <div className="p-6 lg:p-10 w-full mx-auto space-y-8 animate-fade-in-up">
            <ConnectionWizard
                isOpen={wizardOpen}
                onClose={() => setWizardOpen(false)}
                platformName={selectedPlatform}
                onConnect={handleAddChannel}
            />

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold font-serif-display text-slate-900 dark:text-white">Verbindungen</h1>
                    <p className="text-slate-500 mt-1">Verwalte deine Verkaufskanäle (Shopify, eBay, Amazon).</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg transition-all"
                >
                    <Plus size={18} />
                    <span className="hidden md:inline">Manuell hinzufügen</span>
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center text-slate-400">Lade Verbindungen...</div>
            ) : connections.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-10 text-center border border-dashed border-slate-300 dark:border-slate-700">
                    <Share2 className="mx-auto text-slate-400 mb-4" size={48} />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Keine aktiven Verbindungen</h3>
                    <p className="text-slate-500 mb-6">Verbinde deinen ersten Shop, um Produkte zu synchronisieren.</p>
                    <button onClick={() => setIsModalOpen(true)} className="text-indigo-600 font-medium hover:underline">Jetzt Kanal verbinden</button>
                </div>
            ) : (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Aktive Verbindungen</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {connections.map((conn) => (
                            <div key={conn.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                        <Share2 className="text-indigo-600" size={24} />
                                    </div>
                                    <div className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${conn.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {conn.status === 'active' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                        {conn.status}
                                    </div>
                                </div>

                                <h3 className="font-bold text-lg capitalize mb-1">{conn.platform}</h3>
                                <p className="text-sm text-slate-500 mb-4 truncate">{conn.shop_url || 'Keine URL'}</p>

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                    <span className="text-xs text-slate-400">Letzter Sync: {conn.last_sync_at ? new Date(conn.last_sync_at).toLocaleDateString() : 'Nie'}</span>
                                    <button
                                        onClick={() => conn.id && handleDelete(conn.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Available Integrations */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Verfügbare Integrationen</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {INTEGRATIONS.map((integration) => (
                        <div key={integration.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 transition-all group shadow-sm hover:shadow-lg">
                            <div className="flex items-start justify-between mb-4">
                                <img src={integration.icon} alt={integration.name} className="w-12 h-12 object-contain" />
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-md">{integration.type}</span>
                            </div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">{integration.name}</h3>
                            <p className="text-sm text-slate-500 mb-6 min-h-[40px]">{integration.description}</p>

                            <button
                                onClick={() => handleConnectClick(integration.name)}
                                disabled={connecting === integration.name}
                                className="w-full py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                {connecting === integration.name ? (
                                    <>
                                        <RefreshCw size={18} className="animate-spin text-indigo-600" />
                                        <span>Verbinde...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Verbinden</span>
                                        <ExternalLink size={16} className="text-slate-400" />
                                    </>
                                )}
                            </button>
                        </div>
                    ))}

                    {/* Placeholder for more */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                        <Plus className="text-slate-400 mb-3" size={32} />
                        <h3 className="font-medium text-slate-600 dark:text-slate-400">Weitere anfragen</h3>
                        <p className="text-xs text-slate-400 mt-1">Fehlt deine Plattform?</p>
                    </div>
                </div>
            </div>

            <AddChannelModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConnect={handleAddChannel}
            />
        </div>
    );
};