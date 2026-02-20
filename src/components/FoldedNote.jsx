import React from 'react';
import { motion } from 'framer-motion';

const FoldedNote = ({ onClick, style, className, date }) => {
    return (
        <div
            className={`${className} !bg-[#e3d0b9] !text-black overflow-hidden relative shadow-xl flex items-center justify-center`}
            style={style}
            onClick={onClick}
        >
            {/* Paper Texture */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>

            {/* Envelope Flaps (CSS Shapes) */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Bottom Flap */}
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-black/5" style={{ clipPath: 'polygon(0 100%, 50% 0, 100% 100%)' }}></div>
                {/* Top Flap (The Fold) */}
                <div className="absolute top-0 left-0 right-0 h-[60%] bg-black/10 shadow-lg" style={{ clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }}></div>
            </div>

            {/* Wax Seal */}
            <motion.div
                className="relative z-20 w-16 h-16 bg-gradient-to-br from-red-700 to-red-900 rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.4)] border-4 border-red-800/50"
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
            >
                <div className="absolute inset-0 rounded-full border border-white/20 opacity-50"></div>
                <span className="material-symbols-outlined text-red-100/90 text-3xl drop-shadow-md" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            </motion.div>

            {/* Date Stamp */}
            <div className="absolute bottom-3 right-4 text-[10px] font-bold tracking-widest opacity-40 uppercase mix-blend-multiply">
                {date}
            </div>

            <div className="absolute bottom-3 left-4 text-[10px] font-bold tracking-widest opacity-40 uppercase mix-blend-multiply">
                CONFIDENTIAL
            </div>
        </div>
    );
};

export default FoldedNote;
