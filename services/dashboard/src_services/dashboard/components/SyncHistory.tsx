import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle, XCircle, Clock } from 'lucide-react';
import { syncService, SyncLog } from '../services/syncService';

export const SyncHistory: React.FC = () => {
    const [logs, setLogs] = useState<SyncLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const data = await syncService.getLogs();
            setLogs(data);
            setLoading(false);
        };
        load();
    }, []);

    return (
        <div className="p-6 lg:p-10 space-y-8">
            <div>
                <h1 className="text-2xl font-bold font-serif-display text-slate-900 dark:text-white">Synchronisations-Verlauf</h1>
                <p className="text-slate-500 mt-1">Überwache alle Produkt-Updates und Statusänderungen.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-10 text-center text-slate-500">Lade Verlauf...</div>
                ) : logs.length === 0 ? (
                    <div className="p-10 text-center text-slate-500">Keine Einträge vorhanden.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Plattform</th>
                                    <th className="px-6 py-4">Produkte</th>
                                    <th className="px-6 py-4">Zeitpunkt</th>
                                    <th className="px-6 py-4">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            {log.status === 'success' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold"><CheckCircle size={12} /> Erfolg</span>}
                                            {log.status === 'failed' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold"><XCircle size={12} /> Fehler</span>}
                                            {log.status === 'running' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold"><Clock size={12} /> Läuft</span>}
                                        </td>
                                        <td className="px-6 py-4 font-medium capitalize">{log.platform}</td>
                                        <td className="px-6 py-4">{log.products_synced} Items</td>
                                        <td className="px-6 py-4 text-slate-500 text-sm">
                                            {new Date(log.started_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-sm truncate max-w-xs" title={log.details}>
                                            {log.details || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};