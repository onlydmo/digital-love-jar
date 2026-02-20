import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Fireflies = () => {
    const [fireflies, setFireflies] = useState([]);

    useEffect(() => {
        // Generate 15-20 fireflies with random properties
        const count = 15;
        const newFireflies = Array.from({ length: count }).map((_, i) => ({
            id: i,
            x: Math.random() * 100, // %
            y: Math.random() * 100, // %
            size: Math.random() * 4 + 2, // px
            duration: Math.random() * 10 + 10, // s
            delay: Math.random() * 5,
        }));
        setFireflies(newFireflies);
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {fireflies.map((fly) => (
                <motion.div
                    key={fly.id}
                    className="absolute rounded-full bg-amber-200 blur-[1px]"
                    style={{
                        left: `${fly.x}%`,
                        top: `${fly.y}%`,
                        width: fly.size,
                        height: fly.size,
                        boxShadow: `0 0 ${fly.size * 2}px ${fly.size}px rgba(251, 191, 36, 0.4)`,
                    }}
                    animate={{
                        x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
                        y: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
                        opacity: [0, 0.8, 0.2, 0],
                        scale: [0, 1.2, 0.8, 0],
                    }}
                    transition={{
                        duration: fly.duration,
                        repeat: Infinity,
                        delay: fly.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
};

export default Fireflies;
