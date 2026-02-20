import React, { useState } from 'react';
import { useJar } from '../context/JarContext';
import { format } from 'date-fns';
import { Dialog, DialogContent } from "./ui/dialog";

const JourneyPage = () => {
    const { notes } = useJar();
    // Filter only highlighted notes
    const journeyNotes = notes.filter(note => note.is_highlight).reverse(); // Newest first

    const [selectedNote, setSelectedNote] = useState(null);

    return (
        <div className="min-h-screen bg-background-dark text-white pb-32 pt-24 px-4">
            <div className="grain-overlay"></div>

            <header className="text-center mb-12 relative z-10">
                <h1 className="font-handwriting text-6xl text-gold mb-2">Highlights</h1>
                <p className="text-white/60 uppercase tracking-widest text-xs">Our most cherished memories</p>
            </header>

            <div className="max-w-3xl mx-auto space-y-6 relative z-10">
                {journeyNotes.map((note) => (
                    <div
                        key={note.id}
                        onClick={() => setSelectedNote(note)}
                        className="glass p-6 rounded-3xl flex flex-col sm:flex-row gap-6 hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                        {/* Date Bubble */}
                        <div className="flex-shrink-0 flex flex-col items-center justify-center bg-white/5 rounded-2xl w-20 h-20 border border-white/5 group-hover:border-primary/30 transition-colors">
                            <span className="text-xs uppercase font-bold text-white/40">{format(new Date(note.date), 'MMM')}</span>
                            <span className="text-2xl font-black text-primary">{format(new Date(note.date), 'dd')}</span>
                            <span className="text-[10px] text-white/30">{format(new Date(note.date), 'yyyy')}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-grow flex flex-col justify-center">
                            {/* Title (if we had one, for now use generic or truncated msg) */}
                            <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                                Memory from {format(new Date(note.date), 'MMMM do')}
                            </h3>
                            <p className="text-white/70 line-clamp-2 font-handwriting text-xl">
                                {note.message}
                            </p>
                        </div>

                        {/* Media Thumbnail */}
                        {note.image_url && (
                            <div className="flex-shrink-0 w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 group-hover:scale-105 transition-transform">
                                <img src={note.image_url} alt="Memory" className="w-full h-full object-cover" />
                            </div>
                        )}

                        {/* Reaction */}
                        <div className="absolute top-4 right-4 text-white/20 group-hover:text-pink transition-colors">
                            <span className="material-symbols-outlined text-lg">{note.reaction ? 'favorite' : 'lens_blur'}</span>
                        </div>
                    </div>
                ))}

                {journeyNotes.length === 0 && (
                    <div className="text-center py-20 text-white/30">
                        <span className="material-symbols-outlined text-4xl mb-4 block text-gold">star_outline</span>
                        <p className="mb-2">No highlights yet.</p>
                        <button onClick={() => window.location.hash = 'jar'} className="text-primary hover:text-primary/80 underline text-sm">
                            Go to the Jar and star your special memories!
                        </button>
                    </div>
                )}
            </div>

            {/* Note Reader Modal (Reused simplified version) */}
            {selectedNote && (
                <Dialog open={!!selectedNote} onOpenChange={() => setSelectedNote(null)}>
                    <DialogContent className="max-w-2xl bg-[#1a050b]/95 backdrop-blur-xl border-white/10 text-white p-8 sm:rounded-3xl">
                        <div className="flex items-start gap-6">
                            {selectedNote.image_url && (
                                <div className="w-1/3 rounded-xl overflow-hidden shadow-2xl rotate-[-2deg]">
                                    <img src={selectedNote.image_url} alt="Memory" className="w-full h-auto" />
                                </div>
                            )}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-4 opacity-70">
                                    <span className="material-symbols-outlined text-primary text-sm">calendar_today</span>
                                    <span className="text-xs uppercase tracking-widest">{format(new Date(selectedNote.date), 'MMMM do, yyyy')}</span>
                                </div>
                                <p className="font-handwriting text-3xl leading-relaxed text-white/90">
                                    {selectedNote.message}
                                </p>
                                {selectedNote.spotify_url && (
                                    <div className="mt-6 pt-6 border-t border-white/10">
                                        <iframe src={`https://open.spotify.com/embed/track/${selectedNote.spotify_url.split('/').pop().split('?')[0]}?theme=0`} width="100%" height="80" frameBorder="0" allow="encrypted-media" className="rounded-xl bg-transparent"></iframe>
                                    </div>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default JourneyPage;
