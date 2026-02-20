import React from 'react';

const StarryBackground = () => {
    // Generate random stars
    const stars = Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 3 + 1 + 'px',
        animationDuration: `${Math.random() * 3 + 2}s`,
        animationDelay: `${Math.random() * 2}s`
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {stars.map(star => (
                <div
                    key={star.id}
                    className="absolute bg-white rounded-full opacity-20 animate-twinkle"
                    style={{
                        top: star.top,
                        left: star.left,
                        width: star.size,
                        height: star.size,
                        animationDuration: star.animationDuration,
                        animationDelay: star.animationDelay
                    }}
                />
            ))}
        </div>
    );
};

export default StarryBackground;
