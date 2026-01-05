import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { AVVModal } from './AVVModal';

export const DashboardLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isAVVModalOpen, setIsAVVModalOpen] = useState(false);

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex-1 overflow-y-auto flex flex-col">
                    <Outlet />
                    <Footer onOpenAVV={() => setIsAVVModalOpen(true)} />
                </main>
            </div>

            {/* AVV Modal for viewing/signing via Footer */}
            <AVVModal
                isOpen={isAVVModalOpen}
                onSigned={() => setIsAVVModalOpen(false)}
            />
        </div>
    );
};
