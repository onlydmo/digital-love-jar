import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useJar } from '../context/JarContext';

import { useToast } from '../context/ToastContext';

const SettingsPage = () => {
    const { addToast } = useToast();
    const { couple, logout, updateCouple } = useAuth();
    const { notes } = useJar();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        partner_1_name: '',
        partner_2_name: '',
        anniversary_date: '',
        theme: 'classic',
        ambience: 'night',
        secret_code: ''
    });
    const [showPin, setShowPin] = useState(false);

    useEffect(() => {
        if (couple) {
            setFormData({
                partner_1_name: couple.partner_1_name || '',
                partner_2_name: couple.partner_2_name || '',
                anniversary_date: couple.anniversary_date || '',
                theme: couple.theme || 'classic',
                ambience: couple.ambience || 'night',
                secret_code: couple.secret_code || ''
            });
        }
    }, [couple]);

    // ... (rest of state)

    const handleSave = async () => {
        setLoading(true);

        // Sanitize data
        const updates = {
            ...formData,
            anniversary_date: formData.anniversary_date === '' ? null : formData.anniversary_date
        };

        const { error } = await supabase
            .from('couples')
            .update(updates)
            .eq('id', couple.id);

        if (error) {
            addToast(`Error: ${error.message}`, 'error');
        } else {
            updateCouple(updates);
            addToast("Settings saved successfully! 💖", 'success');
        }
        setLoading(false);
    };

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notes, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "our_love_jar_memories.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return (
        <div className="min-h-screen bg-background-dark text-white pb-32 pt-24 px-4">
            <div className="max-w-2xl mx-auto space-y-12">

                <header className="flex items-center gap-4 mb-8">
                    <button onClick={() => window.history.back()} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="font-handwriting text-5xl text-gold mb-2">Jar Settings</h1>
                        <p className="text-white/60">Customize your shared space.</p>
                    </div>
                </header>

                {/* 1. The Vibe */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-pink">palette</span>
                        The Vibe
                    </h2>

                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-white/80">Ambience</label>
                        <div className="grid grid-cols-3 gap-4">
                            {['night', 'sunset', 'rain'].map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setFormData({ ...formData, ambience: mode })}
                                    className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${formData.ambience === mode ? 'border-primary bg-primary/20 shadow-[0_0_15px_rgba(255,189,89,0.2)]' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                                >
                                    <span className="material-symbols-outlined text-2xl">
                                        {mode === 'night' ? 'bedtime' : mode === 'sunset' ? 'wb_twilight' : 'rainy'}
                                    </span>
                                    <span className="text-xs font-bold uppercase">{mode}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 glass rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-full">
                                <span className="material-symbols-outlined">music_note</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Background Music</h3>
                                <p className="text-xs text-white/50">Play soft lofi beats</p>
                            </div>
                        </div>
                        <button className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors">
                            Coming Soon
                        </button>
                    </div>
                </section>

                {/* 1.5. Notifications */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-pink">notifications</span>
                        Notifications
                    </h2>
                    <div className="glass p-6 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/20 rounded-full text-primary">
                                <span className="material-symbols-outlined">favorite</span>
                            </div>
                            <div>
                                <p className="font-bold">Love Alerts</p>
                                <p className="text-xs text-white/50">Get notified when your partner drops a note.</p>
                            </div>
                        </div>
                        <button
                            onClick={async () => {
                                const permission = await Notification.requestPermission();
                                if (permission === 'granted') {
                                    addToast("Notifications enabled! You'll be the first to know. 💌", 'success');
                                } else {
                                    addToast("Notifications disabled. Check browser settings.", 'error');
                                }
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors border ${Notification.permission === 'granted' ? 'bg-green-500/20 border-green-500/50 text-green-200' : 'bg-white/10 hover:bg-white/20 border-white/10'}`}
                        >
                            {Notification.permission === 'granted' ? 'Enabled' : 'Enable'}
                        </button>
                    </div>
                </section>

                {/* 2. Security & Access */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-pink">lock</span>
                        Security & Access
                    </h2>

                    <div className="bg-white/5 p-6 rounded-xl space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <label className="block text-sm font-medium text-white/80">Secret Code (PIN)</label>
                                <p className="text-xs text-white/40">Used to login on other devices</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <input
                                        type={showPin ? "text" : "password"}
                                        value={formData.secret_code}
                                        onChange={(e) => setFormData({ ...formData, secret_code: e.target.value.toUpperCase() })}
                                        onBlur={() => setShowPin(false)}
                                        className="bg-black/20 border border-white/10 rounded-l px-3 py-1 text-center font-mono tracking-widest w-24 focus:border-primary outline-none"
                                        maxLength={4}
                                    />
                                </div>
                                <button
                                    onClick={() => setShowPin(!showPin)}
                                    className="bg-white/10 hover:bg-white/20 border border-l-0 border-white/10 rounded-r px-3 py-1 h-full flex items-center justify-center transition-colors"
                                    title={showPin ? "Hide Code" : "Reveal Code"}
                                >
                                    <span className="material-symbols-outlined text-sm">
                                        {showPin ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Share Link Button */}
                        <button
                            onClick={() => {
                                const link = `${window.location.origin}/?invite=${formData.secret_code}`;
                                navigator.clipboard.writeText(link);
                                addToast("Invite link copied to clipboard! 🔗", 'success');
                            }}
                            className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium text-gold/80 hover:text-gold"
                        >
                            <span className="material-symbols-outlined text-lg">link</span>
                            Copy Invite Link
                        </button>

                        <p className="text-xs text-gold/60 italic">
                            * Note: Changing this updates it for both partners immediately.
                        </p>
                    </div>
                </section>

                {/* 2. Our Profile - MOVED TO ProfilePage.jsx */}
                <div className="p-4 glass rounded-xl flex items-center justify-between opacity-70 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => window.location.hash = 'profile'}>
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 p-2 rounded-full">
                            <span className="material-symbols-outlined text-white">manage_accounts</span>
                        </div>
                        <div>
                            <p className="font-bold">Edit Profile</p>
                            <p className="text-xs text-white/50">Change names, avatars & anniversary</p>
                        </div>
                    </div>
                    <span className="material-symbols-outlined text-white/30">chevron_right</span>
                </div>

                {/* 3. Data & Actions */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-pink">database</span>
                        Data & Actions
                    </h2>

                    <div className="flex flex-col gap-3">
                        <button onClick={handleExport} className="flex items-center justify-between p-4 glass rounded-xl hover:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-gold">download</span>
                                <span className="font-medium">Export All Memories</span>
                            </div>
                            <span className="material-symbols-outlined text-white/30 group-hover:text-white transition-colors">chevron_right</span>
                        </button>

                        <button onClick={() => { logout(); window.location.hash = ''; window.location.reload(); }} className="flex items-center justify-between p-4 glass rounded-xl hover:bg-red-500/10 transition-colors group">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-red-400">logout</span>
                                <span className="font-medium text-red-200">Disconnect Jar</span>
                            </div>
                        </button>
                    </div>
                </section>

                <div className="pt-8 flex justify-center">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-primary hover:bg-primary/90 text-background-dark font-bold text-lg px-12 py-4 rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                    >
                        {loading ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SettingsPage;
