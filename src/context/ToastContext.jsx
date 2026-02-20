import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success', duration = 3000, position = 'top-center') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type, duration, position }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}

            {/* Top Center Toasts */}
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.filter(t => !t.position || t.position === 'top-center').map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: -20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.9 }}
                            className={`
                                px-6 py-3 rounded-full shadow-xl text-white font-handwriting text-xl backdrop-blur-md border border-white/20 whitespace-nowrap
                                ${toast.type === 'success' ? 'bg-green-500/80 shadow-green-500/20' : 'bg-red-500/80 shadow-red-500/20'}
                            `}
                        >
                            {toast.message}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Side Popup (Bottom Right) */}
            <div className="fixed bottom-24 right-6 z-[100] flex flex-col gap-2 pointer-events-none items-end">
                <AnimatePresence>
                    {toasts.filter(t => t.position === 'bottom-right').map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 50, scale: 0.9 }}
                            className="bg-background-dark/90 border border-gold/30 p-4 rounded-xl shadow-[0_0_20px_rgba(255,215,0,0.2)] text-white backdrop-blur-md max-w-xs pointer-events-auto"
                        >
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-gold animate-bounce">lightbulb</span>
                                <div>
                                    <h4 className="font-bold text-gold text-sm uppercase tracking-wider mb-1">Did you know?</h4>
                                    <p className="text-sm text-white/80 leading-snug">{toast.message}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

        </ToastContext.Provider>
    );
};
