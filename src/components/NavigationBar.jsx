import React from 'react';

const NavigationBar = ({ currentView, onViewChange }) => {
    const navItems = [
        { id: 'jar', label: 'The Jar', icon: 'volunteer_activism' },
        { id: 'journey', label: 'Highlights', icon: 'auto_stories' },
        { id: 'admin', label: 'Insights', icon: 'monitoring' },
        { id: 'studio', label: 'Studio', icon: 'add_circle' },
    ];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
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
                                <div className="absolute inset-0 bg-primary rounded-full -z-10 layoutId='nav-pill'" />
                            )}
                            <span className="material-symbols-outlined text-xl">{item.icon}</span>
                            <span className="text-sm">{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default NavigationBar;
