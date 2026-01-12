import React, { useState, useEffect } from 'react';
import { useProductWizardStore } from '../../store/productWizardStore';
import {
    Music,
    MessageCircle,
    Heart,
    Share2,
    Hash,
    Repeat,
    Scissors,
    Volume2,
    MonitorPlay,
    Instagram,
    Youtube
} from 'lucide-react';

export const SocialMediaMaster: React.FC = () => {
    const { stepData, setStepData } = useProductWizardStore();

    // Get Video from Media Step
    const mediaData = stepData[3] || {};
    const productVideo = mediaData.video;

    // AI Data for pre-fill
    const aiData = stepData[2] || {};

    // Restore saved data or default to AI
    const savedData = stepData[20] || {};

    const [socialContent, setSocialContent] = useState({
        caption: savedData.caption || aiData.tiktok?.caption || '', // Legacy mappings
        hashtags: savedData.hashtags || aiData.tiktok?.hashtags || '',
        sound: savedData.sound || '',
        allowRemix: savedData.allowRemix !== false, // General "Remix/Duet" permission
        isViral: savedData.isViral || false
    });

    useEffect(() => {
        setStepData(20, {
            ...socialContent,
            // Map legacy fields for backend compatibility if needed
            tiktok: {
                caption: socialContent.caption,
                hashtags: socialContent.hashtags,
                sound: socialContent.sound,
                duet: socialContent.allowRemix,
                stitch: socialContent.allowRemix
            }
        });
    }, [socialContent, setStepData]);

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                    <Share2 size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold font-serif-display text-slate-900 dark:text-white">Social Video Master</h2>
                    <p className="text-slate-500 dark:text-slate-400">Ein Master-Setup für TikTok, Reels & YouTube Shorts.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* LEFT COLUMN: Universal Phone Preview */}
                <div className="lg:col-span-4 flex justify-center lg:justify-start">
                    <div className="relative w-[300px] h-[600px] bg-black rounded-[2rem] border-[6px] border-slate-900 shadow-2xl overflow-hidden ring-4 ring-slate-100 dark:ring-slate-800">

                        {/* Status Bar */}
                        <div className="absolute top-0 inset-x-0 h-8 z-20 flex justify-between items-center px-5 pt-2">
                            <span className="text-[10px] font-bold text-white shadow-sm">9:41</span>
                            <div className="flex gap-1">
                                <div className="w-4 h-2.5 bg-white rounded-[2px] shadow-sm" />
                                <div className="w-0.5 h-2.5 bg-white/50 rounded-[1px] shadow-sm" />
                            </div>
                        </div>

                        {/* Top Platform Icons (Simulating cross-post preview) */}
                        <div className="absolute top-12 left-0 right-0 z-20 flex justify-center gap-3 opacity-60">
                            <div className="w-6 h-6 bg-black/40 backdrop-blur rounded-full flex items-center justify-center border border-white/10">
                                <MonitorPlay size={12} className="text-white" />
                            </div>
                            <div className="w-6 h-6 bg-black/40 backdrop-blur rounded-full flex items-center justify-center border border-white/10">
                                <Instagram size={12} className="text-white" />
                            </div>
                            <div className="w-6 h-6 bg-black/40 backdrop-blur rounded-full flex items-center justify-center border border-white/10">
                                <Youtube size={12} className="text-white" />
                            </div>
                        </div>

                        {/* Video Content */}
                        <div className="absolute inset-0 z-0 bg-slate-900 flex items-center justify-center">
                            {productVideo ? (
                                <video
                                    src={productVideo}
                                    className="w-full h-full object-cover"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                />
                            ) : (
                                <div className="text-center p-6">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/10">
                                        <MonitorPlay size={32} className="text-white/50" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-white/70 text-sm font-bold">Kein Video</p>
                                        <p className="text-white/30 text-[10px]">Bitte erst Video hochladen.</p>
                                    </div>
                                </div>
                            )}

                            {/* Dark Gradient Overlay */}
                            <div className="absolute bottom-0 inset-x-0 h-56 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />
                        </div>

                        {/* Right Interaction Bar */}
                        <div className="absolute bottom-24 right-3 z-20 flex flex-col gap-5 items-center">
                            {/* Like */}
                            <div className="flex flex-col items-center gap-0.5">
                                <div className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/10">
                                    <Heart size={18} fill="white" className="text-white" />
                                </div>
                                <span className="text-white text-[9px] font-bold shadow-black drop-shadow-md">84K</span>
                            </div>
                            {/* Comment */}
                            <div className="flex flex-col items-center gap-0.5">
                                <div className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/10">
                                    <MessageCircle size={18} fill="white" className="text-white" />
                                </div>
                                <span className="text-white text-[9px] font-bold shadow-black drop-shadow-md">1.2K</span>
                            </div>
                            {/* Share */}
                            <div className="flex flex-col items-center gap-0.5">
                                <div className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/10">
                                    <Share2 size={18} fill="white" className="text-white" />
                                </div>
                                <span className="text-white text-[9px] font-bold shadow-black drop-shadow-md">Share</span>
                            </div>
                        </div>

                        {/* Bottom Info Area */}
                        <div className="absolute bottom-5 left-3 right-14 z-20 text-white text-left">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="font-bold text-xs shadow-black drop-shadow-md flex items-center gap-1.5">
                                    @DeinShop
                                    <div className="bg-blue-500 rounded-full w-3 h-3 flex items-center justify-center">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-1.5 h-1.5 text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Caption Preview */}
                            <div className="mb-3">
                                <p className="text-[11px] leading-snug opacity-95 shadow-black drop-shadow-md line-clamp-2 font-medium">
                                    {socialContent.caption || "Hier steht deine virale Caption..."}
                                </p>
                                {socialContent.hashtags && (
                                    <p className="text-[11px] font-bold text-white shadow-black drop-shadow-md mt-0.5 opacity-90 truncate">
                                        {socialContent.hashtags}
                                    </p>
                                )}
                            </div>

                            {/* Sound Preview */}
                            <div className="flex items-center gap-2 opacity-90">
                                <Music size={10} className="text-white" />
                                <div className="overflow-hidden w-24">
                                    <p className="text-[9px] font-medium whitespace-nowrap">
                                        {socialContent.sound || "Original Audio • DeinShop"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Spinning Disk */}
                        <div className="absolute bottom-5 right-3 z-20">
                            <div className="w-9 h-9 bg-slate-900 rounded-full border-[3px] border-slate-800 flex items-center justify-center overflow-hidden animate-spin-slow">
                                <div className="w-full h-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 opacity-80" />
                                <div className="absolute w-2 h-2 bg-black rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Settings */}
                <div className="lg:col-span-8 space-y-6">

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">

                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="bg-indigo-100 dark:bg-slate-800 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                                <MonitorPlay size={20} />
                            </div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Content Einstellungen</h3>
                            <span className="ml-auto text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
                                Gilt für TikTok, Reels & Shorts
                            </span>
                        </div>

                        {/* Sound Input */}
                        <div className="mb-6">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                <Music size={16} className="text-pink-500" />
                                Trending Audio / Sound
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={socialContent.sound}
                                    onChange={(e) => setSocialContent({ ...socialContent, sound: e.target.value })}
                                    placeholder="Suche nach Sounds (z.B. 'Trending Pop', 'Chill Beats')..."
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl px-4 py-3 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                />
                                <div className="absolute right-4 top-3.5 text-slate-400">
                                    <Volume2 size={16} />
                                </div>
                            </div>
                        </div>

                        {/* Caption & Hashtags Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Caption */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    <MessageCircle size={16} className="text-blue-500" />
                                    Caption
                                </label>
                                <textarea
                                    value={socialContent.caption}
                                    onChange={(e) => setSocialContent({ ...socialContent, caption: e.target.value })}
                                    placeholder="Eine starke Beschreibung für dein Video..."
                                    className="w-full h-[140px] bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl px-4 py-3 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none"
                                    maxLength={300}
                                />
                                <div className="flex justify-end mt-1.5">
                                    <span className="text-[10px] font-bold text-slate-400">{socialContent.caption.length}/300</span>
                                </div>
                            </div>

                            {/* Hashtags & Settings */}
                            <div className="flex flex-col gap-6">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        <Hash size={16} className="text-emerald-500" />
                                        Hashtags
                                    </label>
                                    <div className="relative">
                                        <textarea
                                            value={socialContent.hashtags}
                                            onChange={(e) => setSocialContent({ ...socialContent, hashtags: e.target.value })}
                                            placeholder="#fashion #viral #musthave"
                                            className="w-full h-[140px] bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl px-4 py-3 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none font-medium text-indigo-600 dark:text-indigo-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Universal Toggles */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-600 flex items-center justify-center text-slate-900 dark:text-white">
                                        <Repeat size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Interaktionen erlauben</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Aktiviert Duett (TikTok), Remix (Reels) & Stitch.</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={socialContent.allowRemix} onChange={(e) => setSocialContent({ ...socialContent, allowRemix: e.target.checked })} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
};
