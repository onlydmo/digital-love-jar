import React from 'react';

const JarOverlay = () => {
    return (
        <div className="jar-overlay-container" style={{ width: '80vmin', height: '80vmin', maxWidth: '500px', maxHeight: '700px' }}>
            <svg
                viewBox="0 0 200 300"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: '100%', height: '100%', overflow: 'visible' }}
            >
                {/* Shadow/Glow behind */}
                <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="5" result="blur" />
                    </filter>
                    <linearGradient id="jarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0.1)', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0.05)', stopOpacity: 1 }} />
                    </linearGradient>
                    <linearGradient id="reflectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0.4)', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0.0)', stopOpacity: 0 }} />
                    </linearGradient>
                </defs>

                {/* Jar Body Outline */}
                <path
                    d="M 40 10 L 160 10 L 160 30 C 160 40 180 40 180 60 L 180 260 C 180 280 160 295 100 295 C 40 295 20 280 20 260 L 20 60 C 20 40 40 40 40 30 Z"
                    fill="url(#jarGradient)"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="2"
                />

                {/* Lid Area Detail */}
                <path
                    d="M 40 30 L 160 30"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1"
                    fill="none"
                />

                {/* Reflection Highlight (Left Side) */}
                <path
                    d="M 30 65 Q 45 150 30 250"
                    stroke="url(#reflectionGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    fill="none"
                    filter="url(#glow)"
                    opacity="0.6"
                />

                {/* Right Side Subtle Highlight */}
                <path
                    d="M 170 70 Q 160 150 170 240"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                />

            </svg>
        </div>
    );
};

export default JarOverlay;
