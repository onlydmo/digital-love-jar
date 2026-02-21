import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { format, addDays, startOfDay, differenceInDays } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";

const AdminDashboard = ({ initialTab }) => {
    const { couple, logout } = useAuth();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(initialTab === 'create');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (initialTab === 'create') {
            // Small delay to ensure mount and prevent navigation race conditions
            const timer = setTimeout(() => {
                openEditModal();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [initialTab]);

    useEffect(() => {
        fetchNotes();

        // Realtime subscription for instant updates (e.g. when partner opens a note)
        const channel = supabase.channel(`public:notes_dashboard_${couple.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'notes',
                filter: `couple_id=eq.${couple.id}`
            }, () => {
                fetchNotes();
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [couple]);

    const fetchNotes = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('couple_id', couple.id)
            .order('date', { ascending: true });

        if (error) console.error("Error fetching notes:", error);
        else setNotes(data || []);
        setLoading(false);
    };

    // Calculate Stats
    const totalMemories = notes.length;
    const notesOpened = notes.filter(n => n.is_opened).length;
    const reactionsReceived = notes.filter(n => n.reaction).length;

    // Derived "Days Together" (Mock or from couple creation date if available)
    const daysTogether = couple ? differenceInDays(new Date(), new Date(couple.created_at)) : 1;

    // Next Surprise
    const futureNotes = notes.filter(n => new Date(n.date) > new Date()).sort((a, b) => new Date(a.date) - new Date(b.date));
    const nextSurprise = futureNotes[0];

    // Recent Moments (Reacted or Opened)
    const recentMoments = notes
        .filter(n => n.reaction || n.is_opened)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);

    const openEditModal = (note = null) => {
        if (!note) {
            // New Note
            setEditingNote({
                message: '',
                date: format(new Date(), 'yyyy-MM-dd'),
                is_locked: false
            });
        } else {
            setEditingNote({ ...note });
        }
        setIsDialogOpen(true);
    };

    const [signature, setSignature] = useState('none'); // 'p1', 'p2', 'none'

    // ... inside handleSave
    const handleSave = async () => {
        if (!editingNote) return;
        setLoading(true);

        let finalMessage = editingNote.message;
        if (signature === 'p1' && couple.partner_1_name) finalMessage += `\n\n~ ${couple.partner_1_name}`;
        if (signature === 'p2' && couple.partner_2_name) finalMessage += `\n\n~ ${couple.partner_2_name}`;

        const noteData = {
            message: finalMessage,
            image_url: editingNote.image_url,
            spotify_url: editingNote.spotify_url,
            is_locked: editingNote.is_locked,
            lock_code: editingNote.lock_code,
            date: editingNote.date,
            couple_id: couple?.id
        };

        let error;
        if (editingNote.id) {
            // If editing, we don't re-append signature if already there, 
            // but for simplicity let's just save the message as is from the textarea if editing.
            // Actually, for new notes, we append. For existing, user edits the text directly.
            // Let's only append if it's a NEW note to avoid double signing.
            const { error: err } = await supabase.from('notes').update(noteData).eq('id', editingNote.id);
            error = err;
        } else {
            const { error: err } = await supabase.from('notes').insert([noteData]);
            error = err;
        }

        if (error) {
            alert("Error saving note: " + (error.message || error.details || JSON.stringify(error)));
            console.error(error);
        } else {
            // Mark validation for notification filtering
            localStorage.setItem('love_jar_last_sent', Date.now().toString());

            fetchNotes();
            setIsDialogOpen(false);
        }
        setLoading(false);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${editingNote.id || 'new'}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage.from('jar-images').upload(filePath, file);

        if (uploadError) {
            alert("Upload failed: " + uploadError.message);
            setUploading(false);
            return;
        }

        const { data } = supabase.storage.from('jar-images').getPublicUrl(filePath);
        setEditingNote(prev => ({ ...prev, image_url: data.publicUrl }));
        setUploading(false);
    };


    // Calculate Streak based on Opening Consistency (24h window)
    const calculateStreak = () => {
        const openedNotes = notes.filter(n => n.is_opened);
        if (!openedNotes.length) return 0;

        // Sort by opened time (descending), using fallbacks for legacy notes
        const sorted = [...openedNotes].sort((a, b) => {
            const dateA = new Date(a.opened_at || a.updated_at || a.date);
            const dateB = new Date(b.opened_at || b.updated_at || b.date);
            return dateB - dateA;
        });

        const lastInteraction = new Date(sorted[0].opened_at || sorted[0].updated_at || sorted[0].date);
        const now = new Date();
        const diffHours = (now - lastInteraction) / (1000 * 60 * 60);

        // Reset if inactive for more than 24 hours
        if (diffHours > 24) return 0;

        let streak = 1;
        for (let i = 0; i < sorted.length - 1; i++) {
            const curr = new Date(sorted[i].opened_at || sorted[i].updated_at || sorted[i].date);
            const next = new Date(sorted[i + 1].opened_at || sorted[i + 1].updated_at || sorted[i + 1].date);
            const gapHours = (curr - next) / (1000 * 60 * 60);

            // Allow overlapping or close openings to count
            if (gapHours <= 24) {
                streak++;
            } else {
                break; // Chain broken
            }
        }
        return streak;
    };

    const currentStreak = calculateStreak();

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-white overflow-x-hidden">
            <div className="grain-overlay"></div>

            {/* Background Gradients */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="fixed bottom-[-5%] right-[-5%] w-[35%] h-[35%] bg-gold/10 rounded-full blur-[100px] pointer-events-none"></div>

            <main className="relative z-10 flex-grow p-6 md:p-12 max-w-7xl mx-auto w-full space-y-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pt-4">
                    <div className="max-w-2xl">
                        <h1 className="font-handwriting text-5xl md:text-7xl text-gold mb-4 leading-tight">Love Insights & Connection Stats</h1>
                        <p className="text-pink/60 text-lg md:text-xl font-medium">A magical look at your journey together, one heartbeat at a time.</p>
                    </div>

                    {/* Streak Badge */}
                    <div className="glass px-6 py-3 rounded-2xl flex items-center gap-4 border border-gold/20 shadow-[0_0_15px_rgba(255,189,89,0.1)]">
                        <div className="bg-gradient-to-br from-orange-400 to-red-500 p-3 rounded-full shadow-lg">
                            <span className="material-symbols-outlined text-white text-xl">local_fire_department</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gold/60">Current Streak</p>
                            <p className="text-2xl font-black text-white leading-none">{currentStreak} Days</p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="glass p-8 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-6xl">calendar_today</span>
                        </div>
                        <p className="text-sm font-medium text-pink/60 uppercase tracking-wider mb-2">Days Together</p>
                        <h3 className="text-4xl font-black text-white">{daysTogether}</h3>
                        <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">trending_up</span> Forever growing
                        </p>
                    </div>

                    <div className="glass p-8 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-6xl">auto_stories</span>
                        </div>
                        <p className="text-sm font-medium text-pink/60 uppercase tracking-wider mb-2">Memories Shared</p>
                        <h3 className="text-4xl font-black text-white">{totalMemories}</h3>
                        <p className="text-xs text-gold mt-2">Notes & Photos</p>
                    </div>

                    {/* Relationship Pulse (Mock Visual) */}
                    <div className="md:col-span-2 glass p-6 rounded-3xl flex flex-col justify-between overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-pink/60 uppercase tracking-wider">Relationship Pulse</p>
                                <h4 className="text-xl font-bold">Activity Over 30 Days</h4>
                            </div>
                            <span className="material-symbols-outlined text-pink">monitoring</span>
                        </div>
                        <div className="h-24 flex items-end gap-1 px-2">
                            {[40, 60, 55, 85, 45, 30, 70, 95, 50, 40, 65, 45].map((h, i) => (
                                <div key={i} className={`flex-1 rounded-t-full transition-all hover:bg-gold/40 ${h > 80 ? 'bg-pink/40 hover:bg-pink/60 shadow-[0_0_10px_rgba(255,159,178,0.3)]' : 'bg-gold/20'}`} style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Col */}
                    <div className="space-y-8">
                        {/* Reactions */}
                        <section>
                            <h2 className="font-handwriting text-3xl text-gold mb-4">Your Love Language</h2>
                            <div className="glass rounded-3xl p-6">
                                <p className="text-xs text-pink/60 mb-6 font-bold uppercase tracking-widest">Most Used Emojis</p>
                                <div className="flex flex-wrap gap-4">
                                    {['❤️', '😂', '✨', '🥰'].map(emoji => (
                                        <div key={emoji} className="flex flex-col items-center gap-2 flex-1 min-w-[60px]">
                                            <div className="size-16 glass rounded-full flex items-center justify-center text-3xl glow-pink border-pink/30">{emoji}</div>
                                            <span className="text-sm font-bold">{notes.filter(n => n.reaction === emoji).length}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Milestones */}
                        <section>
                            <h2 className="font-handwriting text-3xl text-gold mb-4">Next Big Things</h2>
                            <div className="space-y-4">
                                {nextSurprise ? (
                                    <div className="glass p-5 rounded-2xl relative overflow-hidden">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-sm font-bold">Next Note Opens</span>
                                            <span className="text-xs text-pink/80">{format(new Date(nextSurprise.date), 'MMM do')}</span>
                                        </div>
                                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                            <div className="bg-gradient-to-r from-gold to-pink h-full w-[88%] glow-gold"></div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="glass p-5 rounded-2xl text-center text-white/50 text-sm">No upcoming notes scheduled!</div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Col: Feed */}
                    <div className="lg:col-span-2">
                        <h2 className="font-handwriting text-3xl text-gold mb-4">Moments that Mattered</h2>
                        <div className="space-y-6">
                            {recentMoments.map(note => (
                                <div key={note.id} className="glass p-6 rounded-3xl flex flex-col md:flex-row gap-6 border-l-4 border-pink cursor-pointer hover:bg-white/5 transition-colors" onClick={() => openEditModal(note)}>
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="material-symbols-outlined text-gold text-sm">schedule</span>
                                            <span className="text-xs text-white/40 uppercase tracking-tighter">{format(new Date(note.date), 'MMMM do, yyyy')}</span>
                                        </div>
                                        <p className="font-handwriting text-2xl text-white/90 leading-relaxed italic mb-4">
                                            "{note.message}"
                                        </p>
                                        <div className="flex items-center gap-3">
                                            {note.reaction && (
                                                <div className="bg-pink/10 px-3 py-1 rounded-full border border-pink/20 flex items-center gap-2">
                                                    <span className="text-lg">{note.reaction}</span>
                                                    <span className="text-xs font-bold text-pink">Reacted</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {note.image_url && (
                                        <div className="hidden md:block w-32 h-32 rounded-2xl overflow-hidden glass p-1 shirk-0">
                                            <img src={note.image_url} alt="Memory" className="w-full h-full object-cover rounded-xl grayscale-[0.2]" />
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="flex justify-center pt-4">
                                <button onClick={() => openEditModal()} className="bg-gradient-to-r from-gold to-pink px-10 py-4 rounded-2xl text-background-dark font-black text-lg hover:scale-105 transition-transform flex items-center gap-3 shadow-xl glow-gold">
                                    <span className="material-symbols-outlined">edit</span>
                                    Drop a New Note
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* EDIT DIALOG */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px] bg-background-dark/95 backdrop-blur-2xl border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="font-handwriting text-3xl text-gold">
                            {editingNote?.id ? "Edit Memory" : "Create New Memory"}
                        </DialogTitle>
                    </DialogHeader>
                    {editingNote && (
                        <div className="grid gap-6 py-4">
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input type="date" value={editingNote.date || ''} onChange={e => setEditingNote({ ...editingNote, date: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                            </div>
                            <div className="space-y-2">
                                <Label>Message</Label>
                                <Textarea value={editingNote.message || ''} onChange={e => setEditingNote({ ...editingNote, message: e.target.value })} className="bg-white/5 border-white/10 text-white font-handwriting text-xl" rows={4} />
                            </div>
                            <div className="space-y-2">
                                <Label>Photo</Label>
                                <Input type="file" accept="image/*" onChange={handleImageUpload} className="bg-white/5 border-white/10 text-white" />
                            </div>
                            <div className="space-y-2">
                                <Label>Music Link</Label>
                                <Input
                                    type="text"
                                    placeholder="Spotify or YouTube URL"
                                    value={editingNote.spotify_url || ''}
                                    onChange={e => setEditingNote({ ...editingNote, spotify_url: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Signed By</Label>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setSignature(signature === 'p1' ? 'none' : 'p1')}
                                        className={`flex-1 p-2 rounded border transition-colors text-sm ${signature === 'p1' ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                    >
                                        {couple?.partner_1_name || 'Partner 1'}
                                    </button>
                                    <button
                                        onClick={() => setSignature(signature === 'p2' ? 'none' : 'p2')}
                                        className={`flex-1 p-2 rounded border transition-colors text-sm ${signature === 'p2' ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                    >
                                        {couple?.partner_2_name || 'Partner 2'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-white/50">Cancel</Button>
                        <Button onClick={handleSave} disabled={loading || uploading} className="bg-gold text-black hover:bg-gold/80">Save Memory</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminDashboard;
