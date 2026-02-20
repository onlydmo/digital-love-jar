import React from 'react';

const Sparkles = () => {
    // Generate static random positions for performance
    const particles = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 3 + Math.random() * 4,
        size: 2 + Math.random() * 4
    }));

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {particles.map(p => (
                <div
                    key={p.id}
                    className="absolute bg-yellow-200 rounded-full opacity-0 animate-pulse shadow-[0_0_10px_rgba(253,224,71,0.6)]"
                    style={{
                        left: `${p.left}%`,
                        top: `${p.top}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        animation: `twinkle ${p.duration}s infinite ${p.delay}s ease-in-out`
                    }}
                />
            ))}
            <style jsx>{`
                @keyframes twinkle {
                    0% { opacity: 0; transform: scale(0.5) translateY(0); }
                    50% { opacity: 0.8; transform: scale(1.2) translateY(-20px); }
                    100% { opacity: 0; transform: scale(0.5) translateY(-40px); }
                }
            `}</style>
        </div>
    );
};

export default Sparkles;
