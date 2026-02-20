import React from 'react';

const NoteSparkles = () => {
    // Generate static random positions for performance
    const particles = Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 1 + Math.random() * 2,
        size: 2 + Math.random() * 3
    }));

    return (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-visible rounded-sm">
            {particles.map(p => (
                <div
                    key={p.id}
                    className="absolute bg-white rounded-full opacity-0 animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                    style={{
                        left: `${p.left}%`,
                        top: `${p.top}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        animation: `twinkle ${p.duration}s infinite ${p.delay}s ease-in-out`
                    }}
                />
            ))}
        </div>
    );
};

export default NoteSparkles;
