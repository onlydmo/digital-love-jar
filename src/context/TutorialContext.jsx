import React, { createContext, useContext, useState, useEffect } from 'react';
import { safeGetItem, safeSetItem, safeRemoveItem } from '../lib/safeStorage';

const TutorialContext = createContext();

export const useTutorial = () => useContext(TutorialContext);

export const TutorialProvider = ({ children }) => {
    const [activeTutorial, setActiveTutorial] = useState(null);
    const [seenTutorials, setSeenTutorials] = useState([]);
    const seenTutorialsRef = React.useRef([]); // Ref to track seen without triggering re-renders of consumers

    useEffect(() => {
        const stored = safeGetItem('love_jar_tutorials');
        if (stored) {
            const parsed = JSON.parse(stored);
            setSeenTutorials(parsed);
            seenTutorialsRef.current = parsed;
        }
    }, []);

    // Update ref whenever state changes
    useEffect(() => {
        seenTutorialsRef.current = seenTutorials;
    }, [seenTutorials]);

    // Stable function reference
    const startTutorial = React.useCallback((tutorialId) => {
        if (!seenTutorialsRef.current.includes(tutorialId)) {
            setActiveTutorial(tutorialId);
        }
    }, []); // No deps, stable forever

    const completeTutorial = () => {
        if (activeTutorial) {
            const newSeen = [...seenTutorials, activeTutorial];
            setSeenTutorials(newSeen);
            seenTutorialsRef.current = newSeen; // Update ref immediately
            safeSetItem('love_jar_tutorials', JSON.stringify(newSeen));
            setActiveTutorial(null);
        }
    };

    // Debug reset
    const resetTutorials = () => {
        setSeenTutorials([]);
        seenTutorialsRef.current = [];
        safeRemoveItem('love_jar_tutorials');
        window.location.reload();
    };

    return (
        <TutorialContext.Provider value={{ activeTutorial, startTutorial, completeTutorial, resetTutorials }}>
            {children}
        </TutorialContext.Provider>
    );
};
