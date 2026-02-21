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

    const handleAddClick = () => {
        window.location.hash = 'studio';
        setIsOpen(false);
    };

    return (
        <>
            {/* Desktop Navigation (Pill) */}
            <div className="hidden md:block fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
                <nav className="bg-black/80 backdrop-blur-2xl border border-white/10 p-2 rounded-full flex items-center gap-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    {navItems.map(item => {
                        const isActive = currentView === item.id || (item.id === 'studio' && currentView === 'studio');
                        return (
                            <button
                                key={item.id}
                                onClick={() => onViewChange(item.id)}
                                className={`
                                    relative px-6 py-3 rounded-full flex items-center gap-2 transition-all duration-300
                                    ${isActive ? 'text-black font-bold' : 'text-white/60 hover:text-white hover:bg-white/5'}
                                    ${item.id === 'studio' ? 'bg-primary/10 ml-2 hover:bg-primary/20' : ''}
                                `}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-pill"
                                        className={`absolute inset-0 rounded-full -z-10 ${item.id === 'studio' ? 'bg-primary shadow-[0_0_20px_rgba(218,11,63,0.4)]' : 'bg-primary'}`}
                                    />
                                )}
                                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                                <span className="text-sm">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Mobile Action Group (FAB Stack) */}
            <div className="md:hidden fixed bottom-6 right-6 z-[120] flex flex-col gap-4 items-center">
                <AnimatePresence>
                    {isOpen && (
                        <motion.button
                            initial={{ opacity: 0, y: 20, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.8 }}
                            onClick={handleAddClick}
                            className="w-14 h-14 rounded-full bg-primary text-white shadow-[0_10px_30px_rgba(218,11,63,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                        >
                            <span className="material-symbols-outlined text-2xl">add</span>
                        </motion.button>
                    )}
                </AnimatePresence>

                <button
                    onClick={toggleMenu}
                    className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-500
                        ${isOpen ? 'bg-white/10 text-white backdrop-blur-xl rotate-90' : 'bg-primary text-background-dark'}
                    `}
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
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] md:hidden"
                            onClick={toggleMenu}
                        />

                        {/* Sidebar Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-[300px] bg-[#1a050b]/95 backdrop-blur-2xl border-l border-white/10 z-[110] p-10 md:hidden shadow-[-20px_0_60px_rgba(0,0,0,0.8)]"
                        >
                            <div className="flex flex-col h-full">
                                <div className="mb-12">
                                    <div className="bg-primary/20 w-16 h-16 rounded-3xl flex items-center justify-center mb-6 border border-primary/20">
                                        <span className="material-symbols-outlined text-primary text-3xl">favorite</span>
                                    </div>
                                    <h2 className="font-handwriting text-5xl text-gold mb-3">Our Space</h2>
                                    <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-black">Connected Forever</p>
                                </div>

                                <nav className="flex flex-col gap-6">
                                    {navItems.filter(i => i.id !== 'studio').map(item => {
                                        const isActive = currentView === item.id;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => {
                                                    onViewChange(item.id);
                                                    setIsOpen(false);
                                                }}
                                                className={`
                                                    w-full flex items-center gap-5 p-5 rounded-[2rem] transition-all duration-300
                                                    ${isActive ? 'bg-primary text-black font-black shadow-lg shadow-primary/20 scale-105' : 'text-white/40 hover:text-white hover:bg-white/5'}
                                                `}
                                            >
                                                <span className={`material-symbols-outlined text-2xl`}>
                                                    {item.icon}
                                                </span>
                                                <span className="text-sm uppercase tracking-widest">{item.label}</span>
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="active-dot"
                                                        className="ml-auto w-2 h-2 bg-black rounded-full"
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </nav>

                                <div className="mt-auto pt-10 border-t border-white/5 text-center">
                                    <p className="font-handwriting text-2xl text-gold/40 italic">Forever growing together</p>
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
