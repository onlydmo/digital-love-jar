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

        // Realtime subscription
        const channel = supabase.channel('public:notes_global')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notes' }, payload => {
                const newNoteId = payload.new.id;
                console.log("New note detected:", newNoteId);

                // Add to sparkles
                setSparkleIds(prev => [...prev, newNoteId]);

                // Remove from sparkles after 8s
                setTimeout(() => {
                    setSparkleIds(prev => prev.filter(id => id !== newNoteId));
                }, 8000);

                // Add new note to list immediately
                setNotes(prev => [...prev, payload.new].sort((a, b) => new Date(a.date) - new Date(b.date)));
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notes' }, payload => {
                setNotes(prev => prev.map(n => n.id === payload.new.id ? payload.new : n));
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'notes' }, payload => {
                setNotes(prev => prev.filter(n => n.id !== payload.old.id));
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [couple]);

    const fetchNotes = async () => {
        const { data, error } = await supabase
            .from('notes')
            .select('*')
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
