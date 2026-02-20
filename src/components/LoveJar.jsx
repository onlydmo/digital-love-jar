import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useJar } from '../context/JarContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import NoteSparkles from './NoteSparkles';

import FoldedNote from './FoldedNote';

const NOTE_COLORS = ['note-pink', 'note-yellow', 'note-blue', 'note-green'];

const LoveJar = () => {
    const { couple } = useAuth();
    const { notes, loading, sparkleIds, fetchNotes, updateNote } = useJar();
    const [selectedNote, setSelectedNote] = useState(null);
    const [viewMode, setViewMode] = useState('jar'); // 'jar' or 'grid'

    const handleNoteClick = async (note) => {
        setSelectedNote(note);
        if (!note.is_opened) {
            // Optimistic update
            const timestamp = new Date().toISOString();
            updateNote({ ...note, is_opened: true, opened_at: timestamp });

            // Update both flags and timestamp in DB
            const { error } = await supabase.from('notes').update({
                is_opened: true,
                opened_at: timestamp
            }).eq('id', note.id);

            if (error) console.error("Error updating note status:", error);
        }
    };

    const handleReaction = async (note, emoji) => {
        // Optimistic update
        const updatedNote = { ...note, reaction: emoji };
        setSelectedNote(updatedNote);
        setNotes(prev => prev.map(n => n.id === note.id ? updatedNote : n));


        await supabase.from('notes').update({ reaction: emoji }).eq('id', note.id);
        fetchNotes();
    };

    const handleToggleHighlight = async (note) => {
        const newStatus = !note.is_highlight;

        // Optimistic update for UI
        setSelectedNote(prev => ({ ...prev, is_highlight: newStatus }));

        await supabase.from('notes').update({ is_highlight: newStatus }).eq('id', note.id);
        fetchNotes();
    };

    // Helper to generate deterministic-ish random styles based on ID
    const getNoteStyle = (note, index) => {
        const idInt = String(note.id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const colorClass = NOTE_COLORS[idInt % NOTE_COLORS.length];
        const rotation = (idInt % 30) - 15; // -15 to 15 deg
        const bottom = (index * 15) + 20; // Stack them upwards? Or random?
        // Let's try random scattering within the jar area
        const left = (idInt % 60) + 10; // 10% to 70%
        const zIndex = index + 1;

        return {
            className: `${colorClass} w-24 h-24 p-3 rounded-sm shadow-md text-[11px] absolute flex flex-col justify-between transition-transform hover:z-50 hover:scale-110 cursor-pointer`,
            style: {
                bottom: `${(index * 8) + 10}px`,
                left: `${(index % 2 === 0) ? 20 + (idInt % 40) : 100 + (idInt % 40)}px`, // Alternate sides ish
                transform: `rotate(${rotation}deg)`,
                zIndex: zIndex
            }
        };
    };

    return (
        <div className="flex flex-col min-h-screen bg-transparent text-white overflow-hidden relative">

            {/* Top Nav - Simplified for Global Layout */}
            <header className="relative z-20 flex items-center justify-between px-8 py-6 w-full pointer-events-none">
                <div className="flex items-center gap-3 pointer-events-auto">
                    <div className="p-2 bg-primary rounded-lg shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-white">auto_awesome</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight leading-none">Our Shared Jar</h2>
                        <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold mt-1">{notes.length} Memories Collected</p>
                    </div>
                </div>
                {/* Settings & Profile moved to App.jsx */}
            </header>

            <main className="relative flex-1 flex flex-col items-center justify-center overflow-hidden">
                {/* Warm background glow */}
                <div className="absolute inset-0 glow-effect pointer-events-none"></div>



                {/* Floating Add Button */}
                <button onClick={() => window.location.hash = 'studio'} className="absolute right-10 bottom-48 z-30 group">
                    <div className="bg-primary hover:bg-primary/90 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(218,11,63,0.5)] transition-all transform group-hover:scale-110 active:scale-95">
                        <span className="material-symbols-outlined text-3xl">add</span>
                    </div>
                    <span className="absolute right-20 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        ADD NEW MEMORY
                    </span>
                </button>

                {/* Main Content Area */}
                <div className={`relative w-full h-full flex items-center justify-center transition-all duration-500 ${viewMode === 'grid' ? 'p-10 pb-40 overflow-y-auto items-start' : 'pb-32'}`}>

                    {viewMode === 'jar' ? (
                        /* JAR VIEW */
                        <div className="relative w-72 h-[450px] glass-jar z-10 flex flex-col group transition-transform duration-500 hover:-translate-y-2 cursor-pointer" onClick={() => setViewMode('grid')}>
                            {/* Jar Lid */}
                            <div className="h-6 w-3/4 mx-auto mt-[-12px] bg-white/10 border border-white/20 rounded-t-xl jar-rim"></div>

                            {/* Inner Contents */}
                            <div className="flex-1 relative overflow-hidden p-6">
                                {notes.map((note, index) => {
                                    const { className, style } = getNoteStyle(note, index);
                                    const isSparkling = sparkleIds.includes(note.id);
                                    return (
                                        <div
                                            key={note.id}
                                            className={`${className} ${isSparkling ? 'jar-note-glow' : ''}`}
                                            style={style}
                                        >
                                            {isSparkling && <NoteSparkles />}
                                            <div className="font-bold border-b border-black/10 pb-1 mb-1 truncate text-black/70">{format(new Date(note.date), 'MMM d')}</div>
                                            <p className="line-clamp-3 leading-tight text-black/80 font-handwriting text-lg">{note.message}</p>
                                        </div>
                                    );
                                })}

                                {/* Empty State */}
                                {notes.length === 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center text-white/30 font-handwriting text-2xl text-center p-8">
                                        The jar is empty...<br />Start adding memories!
                                    </div>
                                )}
                            </div>
                            {/* Reflection */}
                            <div className="absolute inset-0 pointer-events-none rounded-[inherit] bg-gradient-to-tr from-white/5 via-transparent to-white/10"></div>

                            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-white/30 text-xs font-medium tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                TAP TO OPEN JAR
                            </div>
                        </div>
                    ) : (
                        /* GRID VIEW */
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl animate-in fade-in zoom-in-95 duration-500">
                            {notes.map((note, index) => {
                                // Simple random rotation for grid items too
                                const rotate = (index % 6) - 3;
                                const colorClass = NOTE_COLORS[String(note.id).charCodeAt(0) % NOTE_COLORS.length];
                                const isSparkling = sparkleIds.includes(note.id);

                                if (!note.is_opened) {
                                    return (
                                        <FoldedNote
                                            key={note.id}
                                            className="aspect-square p-6 rounded-sm cursor-pointer transform hover:scale-105 hover:z-10 transition-all duration-300"
                                            style={{ transform: `rotate(${rotate}deg)` }}
                                            onClick={() => handleNoteClick(note)}
                                            date={format(new Date(note.date), 'MMM do')}
                                        />
                                    );
                                }

                                return (
                                    <div
                                        key={note.id}
                                        className={`${colorClass} aspect-square p-6 rounded-sm shadow-lg text-black/80 cursor-pointer transform hover:scale-105 hover:z-10 transition-all duration-300 flex flex-col ${isSparkling ? 'jar-note-glow scale-110 z-50' : ''}`}
                                        style={{ transform: `rotate(${rotate}deg)` }}
                                        onClick={() => handleNoteClick(note)}
                                    >
                                        {isSparkling && <NoteSparkles />}
                                        <div className="flex justify-between items-center mb-4 border-b border-black/10 pb-2">
                                            <span className="font-bold text-xs uppercase tracking-wider opacity-60">{format(new Date(note.date), 'MMM do')}</span>
                                            {note.is_opened && <span className="material-symbols-outlined text-black/30 text-sm">visibility</span>}
                                        </div>

                                        <div className="flex-1 overflow-hidden relative">
                                            <p className="font-handwriting text-2xl leading-tight line-clamp-4">
                                                {note.message.split('\n\n~ ')[0]}
                                                {note.message.includes('\n\n~ ') && (
                                                    <span className="block text-right text-xs mt-2 opacity-60 font-sans tracking-widest uppercase">
                                                        - {note.message.split('\n\n~ ')[1]}
                                                    </span>
                                                )}
                                            </p>
                                        </div>

                                        {(note.image_url || note.spotify_url) && (
                                            <div className="mt-2 flex gap-2 justify-end opacity-50">
                                                {note.image_url && <span className="material-symbols-outlined text-sm">image</span>}
                                                {note.spotify_url && <span className="material-symbols-outlined text-sm">music_note</span>}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Shadow (Only for Jar) */}
                    {viewMode === 'jar' && <div className="absolute bottom-28 w-56 h-8 bg-black/60 blur-xl rounded-full z-0"></div>}
                </div>

                {/* Shelf */}
                <div className="absolute bottom-0 w-full h-32 wooden-shelf z-10 border-t border-white/5">
                    <div className="absolute inset-0 shelf-texture"></div>
                    {/* Shelf Details */}
                    <div className="max-w-6xl mx-auto px-10 h-full flex items-center justify-between opacity-60">
                        <div className="flex gap-8">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-tighter text-white/40">Created</span>
                                <span className="text-sm font-semibold">{couple ? format(new Date(couple.created_at), 'MMM yyyy') : 'Recently'}</span>
                            </div>
                        </div>

                        {/* Toggle View Mode */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode(viewMode === 'jar' ? 'grid' : 'jar')}
                                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${viewMode === 'grid'
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 scale-105'
                                    : 'bg-white/10 hover:bg-white/20 text-white'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-sm">{viewMode === 'jar' ? 'grid_view' : 'close_fullscreen'}</span>
                                {viewMode === 'jar' ? 'View All Memories' : 'Stack in Jar'}
                            </button>
                        </div>
                    </div>
                </div>

            </main>

            {/* Grain Overlay */}
            <div className="grain-overlay"></div>

            {/* Note Reader Modal */}
            <AnimatePresence>
                {selectedNote && (
                    <Dialog open={!!selectedNote} onOpenChange={() => setSelectedNote(null)}>
                        <DialogContent className="max-w-5xl w-full bg-[#1a050b]/95 backdrop-blur-xl border-none text-white p-0 overflow-hidden shadow-2xl h-[90vh] flex flex-col">

                            {/* Header */}
                            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/20 p-2 rounded-full">
                                        <span className="material-symbols-outlined text-primary text-xl">favorite</span>
                                    </div>
                                    <h2 className="text-xl font-bold tracking-wide">A Message from the Heart</h2>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 p-8 md:p-12 flex items-center justify-center overflow-hidden">
                                <div className={`grid grid-cols-1 ${selectedNote.image_url?.startsWith('http') || selectedNote.spotify_url ? 'md:grid-cols-2' : ''} gap-12 w-full max-w-6xl items-center`}>

                                    {/* Left: The Note */}
                                    <div className={`relative group ${!(selectedNote.image_url?.startsWith('http') || selectedNote.spotify_url) ? 'mx-auto max-w-xl w-full' : ''}`}>
                                        {/* Tape */}
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-white/20 backdrop-blur-sm rotate-1 sharp-shadow z-20 mix-blend-overlay"></div>

                                        <div className="bg-[#7ce2d4] text-black/80 p-8 md:p-12 rounded-sm shadow-[0_10px_40px_rgba(0,0,0,0.5)] transform -rotate-1 transition-transform group-hover:rotate-0 max-h-[70vh] flex flex-col font-handwriting text-2xl md:text-3xl leading-relaxed relative overflow-hidden">
                                            {/* Paper Texture Overlay */}
                                            <div className="absolute inset-0 bg-black/5 pointer-events-none grain-overlay opacity-50"></div>

                                            <div className="text-right text-xs font-sans tracking-widest opacity-60 mb-6 uppercase flex-shrink-0">
                                                {format(new Date(selectedNote.date), 'MMMM do, yyyy')}
                                            </div>

                                            {/* Scrollable Content Area */}
                                            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar relative z-10">
                                                <div className="whitespace-pre-wrap">
                                                    {(() => {
                                                        const parts = selectedNote.message.split('\n\n~ ');
                                                        if (parts.length > 1) {
                                                            return (
                                                                <>
                                                                    {parts[0]}
                                                                    <div className="mt-8 pt-6 border-t border-black/10 text-primary font-bold text-xl transform -rotate-2 inline-block w-full text-right font-handwriting">
                                                                        ~ {parts[1]}
                                                                    </div>
                                                                </>
                                                            );
                                                        }
                                                        return selectedNote.message;
                                                    })()}
                                                </div>

                                                <div className="mt-8 pt-6 border-t border-black/10 text-primary font-bold text-xl transform -rotate-2 inline-block">
                                                    Forever yours,
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Media Stack (Conditional) */}
                                    {(selectedNote.image_url?.startsWith('http') || selectedNote.spotify_url) && (
                                        <div className="flex flex-col gap-6 items-center">

                                            {/* Polaroid Photo */}
                                            {selectedNote.image_url?.startsWith('http') && (
                                                <div className="bg-white p-4 pb-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform rotate-2 max-w-xs transition-transform hover:scale-105 duration-500">
                                                    {/* Pin */}
                                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full w-4 h-4 bg-red-500 shadow-md border-2 border-white/50 z-20"></div>
                                                    <div className="aspect-square overflow-hidden bg-gray-100 shadow-inner">
                                                        <img src={selectedNote.image_url} alt="Memory" className="w-full h-full object-cover filter contrast-110" />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Music Player Card */}
                                            {selectedNote.spotify_url && (
                                                <div className="bg-[#1e1e1e] rounded-3xl p-4 w-full max-w-xs shadow-2xl border border-white/5 relative overflow-hidden">
                                                    <iframe src={`https://open.spotify.com/embed/track/${selectedNote.spotify_url.split('/').pop().split('?')[0]}?theme=0`} width="100%" height="80" frameBorder="0" allow="encrypted-media" className="rounded-xl relative z-10 bg-transparent"></iframe>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleToggleHighlight(selectedNote)}
                                                    className={`h-10 w-10 rounded-full transition-colors flex items-center justify-center border ${selectedNote.is_highlight ? 'bg-gold/20 border-gold text-gold' : 'bg-white/5 hover:bg-white/10 border-white/5 text-white/50 hover:text-white'}`}
                                                    title={selectedNote.is_highlight ? "Remove from Highlights" : "Add to Highlights"}
                                                >
                                                    <span className="material-symbols-outlined text-lg">{selectedNote.is_highlight ? 'star' : 'star_border'}</span>
                                                </button>

                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <button className="h-10 px-4 rounded-full bg-white/5 hover:bg-primary/20 hover:text-primary transition-colors flex items-center gap-2 border border-white/5 group">
                                                            <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">favorite</span>
                                                            <span className="text-xs font-bold">{selectedNote.reaction || 'React'}</span>
                                                        </button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-2 bg-black/90 border-white/10 backdrop-blur-xl rounded-full">
                                                        <div className="flex gap-2">
                                                            {['❤️', '😂', '✨', '🥺', '🔥'].map(emoji => (
                                                                <button
                                                                    key={emoji}
                                                                    onClick={() => handleReaction(selectedNote, emoji)}
                                                                    className="text-2xl hover:scale-125 transition-transform p-1"
                                                                >
                                                                    {emoji}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>

                                                <button className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center border border-white/5">
                                                    <span className="material-symbols-outlined text-lg">share</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 flex justify-center border-t border-white/5 bg-black/20">
                                <button onClick={() => setSelectedNote(null)} className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-bold shadow-[0_4px_20px_rgba(218,11,63,0.4)] flex items-center gap-2 hover:scale-105 transition-transform">
                                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                                    Back to Memory Jar
                                </button>
                            </div>

                        </DialogContent>
                    </Dialog>
                )}
            </AnimatePresence>

        </div>
    );
};

export default LoveJar;

