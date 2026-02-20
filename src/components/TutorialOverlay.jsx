import React from 'react';
import { useTutorial } from '../context/TutorialContext';
import { motion, AnimatePresence } from 'framer-motion';

const TUTORIAL_CONTENT = {
    'jar_intro': {
        title: "The Love Jar",
        text: "This is your shared space. Tap the Jar to open it and read random memories. Use the buttons below to add new notes!",
        position: 'center'
    },
    'journey_intro': {
        title: "Your Journey",
        text: "See your love story unfold. Starred 'Highlights' appear here as significant milestones.",
        position: 'top'
    },
    'studio_intro': {
        title: "Creation Studio",
        text: "Write from the heart. Add notes, date ideas, or spicy secrets. You can verify them before dropping them in!",
        position: 'bottom'
    },
    'profile_intro': {
        title: "Your Profile",
        text: "Customize your names, avatars, and set your Anniversary date to track your days together!",
        position: 'center'
    }
};

const TutorialOverlay = () => {
    const { activeTutorial, completeTutorial } = useTutorial();
    const content = activeTutorial ? TUTORIAL_CONTENT[activeTutorial] : null;

    if (!activeTutorial || !content) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                onClick={completeTutorial}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-background-dark border border-gold/30 p-8 rounded-3xl max-w-sm text-center shadow-[0_0_50px_rgba(255,215,0,0.15)] relative overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Decorative Shine */}
                    <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-transparent via-white/5 to-transparent rotate-45 pointer-events-none"></div>

                    <div className="mb-6 mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-3xl">lightbulb</span>
                    </div>

                    <h3 className="font-handwriting text-4xl text-gold mb-4">{content.title}</h3>
                    <p className="text-white/80 leading-relaxed mb-8">{content.text}</p>

                    <button
                        onClick={completeTutorial}
                        className="bg-primary text-background-dark font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform shadow-lg shadow-primary/20"
                    >
                        Got it!
                    </button>

                    <p className="mt-4 text-xs text-white/30 uppercase tracking-widest cursor-pointer hover:text-white" onClick={completeTutorial}>
                        Tap anywhere to dismiss
                    </p>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default TutorialOverlay;
