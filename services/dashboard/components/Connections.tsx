import React, { useEffect, useState } from 'react';
import { Share2, Plus, RefreshCw, Trash2, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { connectionService, Connection } from '../services/connectionService';
import { useAuthStore } from '../store/authStore';
import { AddChannelModal } from './AddChannelModal';

export const Connections: React.FC = () => {
    const [connections, setConnections] = useState<Connection[]>([]);
    const [loading, setLoading] = useState(true);
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

        // Modal liefert Daten zurück. Wir senden sie ans Backend.
        // channelData enthält platform, settings, etc.
        const newConnection: Connection = {
            platform: channelData.id, // Modal nutzt 'id' als platform key
            shop_url: channelData.shopUrl || '',
            api_key: 'connected', // Dummy or Real Token
            status: 'active',
            user_id: user.id
        };

        try {
            await connectionService.addConnection(newConnection);
            loadData();
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

    return (
        <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-8">
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
                    <span className="hidden md:inline">Kanal hinzufügen</span>
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
            )}

            <AddChannelModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConnect={handleAddChannel}
            />
        </div>
    );
};