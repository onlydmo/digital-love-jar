import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NavigationBar = ({ currentView, onViewChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { id: 'jar', label: 'The Jar', icon: 'volunteer_activism' },
        { id: 'journey', label: 'Highlights', icon: 'auto_stories' },
        { id: 'admin', label: 'Insights', icon: 'monitoring' },
        { id: 'studio', label: 'Studio', icon: 'add_circle' },
    ];

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <>
            {/* Desktop Navigation (Pill) */}
            <div className="hidden md:block fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <nav className="bg-black/80 backdrop-blur-xl border border-white/10 p-2 rounded-full flex items-center gap-1 shadow-2xl shadow-black/50">
                    {navItems.map(item => {
                        const isActive = currentView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onViewChange(item.id)}
                                className={`
                                    relative px-5 py-3 rounded-full flex items-center gap-2 transition-all duration-300
                                    ${isActive ? 'text-black font-bold' : 'text-white/60 hover:text-white hover:bg-white/5'}
                                `}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-pill"
                                        className="absolute inset-0 bg-primary rounded-full -z-10"
                                    />
                                )}
                                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                                <span className="text-sm">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Mobile Navigation Trigger (Hamburger) */}
            <div className="md:hidden fixed bottom-6 right-6 z-[60]">
                <button
                    onClick={toggleMenu}
                    className="w-14 h-14 rounded-full bg-primary text-background-dark shadow-lg shadow-primary/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                >
                    <span className="material-symbols-outlined text-2xl">
                        {isOpen ? 'close' : 'menu'}
                    </span>
                </button>
            </div>

            {/* Mobile Sidebar Slider */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden"
                            onClick={toggleMenu}
                        />

                        {/* Sidebar Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-[280px] bg-background-dark/95 backdrop-blur-xl border-l border-white/10 z-[110] p-8 md:hidden shadow-[-10px_0_30px_rgba(0,0,0,0.5)]"
                        >
                            <div className="flex flex-col h-full">
                                <div className="mb-10">
                                    <h2 className="font-handwriting text-3xl text-gold mb-2">The Love Jar</h2>
                                    <p className="text-white/40 text-xs uppercase tracking-widest">Connect & Cherish</p>
                                </div>

                                <nav className="flex flex-col gap-4">
                                    {navItems.map(item => {
                                        const isActive = currentView === item.id;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => {
                                                    onViewChange(item.id);
                                                    setIsOpen(false);
                                                }}
                                                className={`
                                                    w-full flex items-center gap-4 p-4 rounded-2xl transition-all
                                                    ${isActive ? 'bg-primary/20 text-primary border border-primary/20' : 'text-white/60 hover:bg-white/5'}
                                                `}
                                            >
                                                <span className={`material-symbols-outlined text-2xl ${isActive ? 'text-primary' : 'text-white/40'}`}>
                                                    {item.icon}
                                                </span>
                                                <span className="font-bold tracking-wide">{item.label}</span>
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="active-dot"
                                                        className="ml-auto w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(255,107,159,0.8)]"
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </nav>

                                <div className="mt-auto pt-8 border-t border-white/5 text-center">
                                    <p className="text-white/20 text-[10px] uppercase tracking-tighter italic">Forever Growing Together</p>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};


export default NavigationBar;
