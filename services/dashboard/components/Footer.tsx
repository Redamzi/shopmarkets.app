import React from 'react';
import { useAuthStore } from '../store/authStore';

interface FooterProps {
    onOpenAVV: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAVV }) => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            <div className="flex justify-center gap-6 mb-4 flex-wrap px-4">
                <a href="#" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">
                    Impressum
                </a>
                <a href="#" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">
                    AGB
                </a>
                <a href="#" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">
                    Datenschutz
                </a>
                <button
                    onClick={onOpenAVV}
                    className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors bg-transparent border-none p-0 cursor-pointer text-sm"
                >
                    AV-Vertrag
                </button>
            </div>
            <div>
                © {currentYear} ShopMarkets.app
            </div>
        </footer>
    );
};
