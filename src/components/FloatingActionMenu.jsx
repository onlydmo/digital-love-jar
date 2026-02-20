import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Plus, RefreshCw, X, Link2, LogOut, PenTool } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';

const FloatingActionMenu = () => {
    const { couple, createCouple, logout } = useAuth();
    const { addToast } = useToast();
    const [isOpen, setIsOpen] = useState(false);

    // 1. Not Connected State
    if (!couple) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { console.log('Connect Clicked'); createCouple(); }}
                    className="cursor-pointer bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full shadow-xl font-handwriting text-xl flex items-center gap-2"
                >
                    <Heart className="w-5 h-5 fill-current text-pink-500 animate-pulse" />
                    <span>Connect Partner ✨</span>
                </motion.button>
            </div>
        );
    }

    // 2. Connected Logic
    const sendBuzz = async () => {
        const channel = supabase.channel(`room:${couple.id}`);
        await channel.send({
            type: 'broadcast',
            event: 'buzz',
            payload: { message: 'Thinking of you!' }
        });
        await supabase.from('buzzes').insert([{ couple_id: couple.id }]);
        addToast("Love Buzz Sent! 💖");
        setIsOpen(false);
    };

    const copyLink = () => {
        const url = `${window.location.origin}/?code=${couple.secret_code}`;
        navigator.clipboard.writeText(url);
        addToast("Link Copied! Share it! 💌");
        setIsOpen(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
            {/* Menu Items */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.8 }}
                        className="flex flex-col gap-3 pointer-events-auto items-end"
                    >
                        <button onClick={sendBuzz} className="bg-pink-500 text-white p-3 rounded-full shadow-lg hover:bg-pink-600 flex items-center gap-2 pr-4 transition-colors active:scale-95">
                            <Heart className="w-5 h-5 fill-current" />
                            <span className="font-medium text-sm">Send Love</span>
                        </button>

                        <button onClick={() => window.location.hash = '#admin'} className="bg-indigo-500 text-white p-3 rounded-full shadow-lg hover:bg-indigo-600 flex items-center gap-2 pr-4 transition-colors active:scale-95">
                            <Plus className="w-5 h-5" />
                            <span className="font-medium text-sm">New Memory</span>
                        </button>

                        <button onClick={copyLink} className="bg-emerald-500 text-white p-3 rounded-full shadow-lg hover:bg-emerald-600 flex items-center gap-2 pr-4 transition-colors active:scale-95">
                            <Link2 className="w-5 h-5" />
                            <span className="font-medium text-sm">Copy Link</span>
                        </button>

                        <button onClick={logout} className="bg-gray-500 text-white p-3 rounded-full shadow-lg hover:bg-gray-600 flex items-center gap-2 pr-4 transition-colors active:scale-95">
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium text-sm">Disconnect</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Toggle */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="bg-white/80 backdrop-blur-md p-4 rounded-full shadow-2xl border border-white/40 pointer-events-auto text-pink-600"
            >
                <Heart className={`w-8 h-8 fill-current ${isOpen ? 'rotate-45' : ''} transition-transform duration-300`} />
            </motion.button>
        </div>
    );
};

export default FloatingActionMenu;
