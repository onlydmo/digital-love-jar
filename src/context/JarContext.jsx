import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const JarContext = createContext();

export const useJar = () => useContext(JarContext);

export const JarProvider = ({ children }) => {
    const { couple } = useAuth();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sparkleIds, setSparkleIds] = useState([]);

    useEffect(() => {
        if (!couple) return;

        fetchNotes();

        // Realtime subscription - filtered to our couple
        let channel;
        try {
            channel = supabase.channel(`public:notes_couple_${couple.id}`)
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'notes',
                    filter: `couple_id=eq.${couple.id}`
                }, payload => {
                    if (payload.eventType === 'INSERT') {

                        const newNoteId = payload.new.id;
                        console.log("New note detected:", newNoteId);

                        // Add to sparkles
                        setSparkleIds(prev => [...prev, newNoteId]);

                        // Remove from sparkles after 8s
                        setTimeout(() => {
                            setSparkleIds(prev => prev.filter(id => id !== newNoteId));
                        }, 8000);

                    } else if (payload.eventType === 'UPDATE') {
                        setNotes(prev => prev.map(n => n.id === payload.new.id ? payload.new : n));
                    } else if (payload.eventType === 'DELETE') {
                        setNotes(prev => prev.filter(n => n.id !== payload.old.id));
                    }
                })
                .subscribe();
        } catch (err) {
            console.warn("[JarContext] Realtime subscription failed (WebSocket unavailable). App will use polling fallback.", err);
        }

        // Polling fallback: refresh notes every 30s in case Realtime is down
        const pollInterval = setInterval(fetchNotes, 30000);

        return () => {
            clearInterval(pollInterval);
            if (channel) supabase.removeChannel(channel);
        };
    }, [couple]);

    const fetchNotes = async () => {
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('couple_id', couple.id)
            .order('date', { ascending: true });

        if (!error && data) {
            setNotes(data);
        }
        setLoading(false);
    };

    const updateNote = (updatedNote) => {
        console.log("[JarContext] Updating note locally:", updatedNote);
        setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
    };

    return (
        <JarContext.Provider value={{ notes, loading, sparkleIds, fetchNotes, updateNote }}>
            {children}
        </JarContext.Provider>
    );
};
