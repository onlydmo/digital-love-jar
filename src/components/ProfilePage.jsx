import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { differenceInDays, format } from 'date-fns';

const ProfilePage = () => {
    const { couple } = useAuth();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showSecret, setShowSecret] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        partner_1_name: '',
        partner_2_name: '',
        partner_1_avatar: '',
        partner_2_avatar: '',
        anniversary_date: ''
    });

    useEffect(() => {
        if (couple) {
            setFormData({
                partner_1_name: couple.partner_1_name || '',
                partner_2_name: couple.partner_2_name || '',
                partner_1_avatar: couple.partner_1_avatar || '',
                partner_2_avatar: couple.partner_2_avatar || '',
                anniversary_date: couple.anniversary_date || '',
                secret_code: couple.secret_code || '',
                security_question: couple.security_question || '',
                security_answer: couple.security_answer || ''
            });
        }
    }, [couple]);

    const handleSave = async () => {
        setLoading(true);
        const { error } = await supabase
            .from('couples')
            .update(formData)
            .eq('id', couple.id);

        if (error) {
            alert("Error updating profile: " + error.message);
        } else {
            alert("Profile updated! 💖");
            window.location.reload();
        }
        setLoading(false);
    };

    const handleAvatarUpload = async (e, partnerField) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `avatar-${couple.id}-${partnerField}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage.from('jar-images').upload(filePath, file);

        if (uploadError) {
            alert("Upload failed: " + uploadError.message);
            setUploading(false);
            return;
        }

        const { data } = supabase.storage.from('jar-images').getPublicUrl(filePath);
        setFormData(prev => ({ ...prev, [partnerField]: data.publicUrl }));
        setUploading(false);
    };

    // Calculate Days Together
    const daysTogether = formData.anniversary_date
        ? differenceInDays(new Date(), new Date(formData.anniversary_date))
        : (couple ? differenceInDays(new Date(), new Date(couple.created_at)) : 0);

    return (
        <div className="min-h-screen bg-background-dark text-white pb-32 pt-24 px-4 overflow-x-hidden">
            {/* Background Gradients */}
            <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="fixed bottom-[-5%] left-[-5%] w-[35%] h-[35%] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-2xl mx-auto space-y-12 relative z-10">

                <header className="flex items-center gap-4 mb-8">
                    <button onClick={() => window.history.back()} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="font-handwriting text-5xl text-gold mb-2">Our Profile</h1>
                        <p className="text-white/60">The story of us.</p>
                    </div>
                </header>

                {/* 1. Connection Stats */}
                <section className="glass p-8 rounded-3xl relative overflow-hidden text-center group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-8xl">favorite</span>
                    </div>

                    <p className="text-sm font-bold text-pink/80 uppercase tracking-widest mb-4">Together For</p>
                    <div className="flex items-baseline justify-center gap-2">
                        <span className="text-6xl md:text-8xl font-black text-white">{daysTogether}</span>
                        <span className="text-xl md:text-2xl font-handwriting text-gold">Days</span>
                    </div>
                    <p className="text-xs text-white/40 mt-4">
                        {formData.anniversary_date ? `Since ${format(new Date(formData.anniversary_date), 'MMMM do, yyyy')}` : 'Set your anniversary below!'}
                    </p>
                </section>

                {/* 2. Identity & Avatars */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-pink">face</span>
                        The Couple
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Partner 1 */}
                        <div className="glass p-6 rounded-2xl flex flex-col items-center gap-4">
                            <div className="relative group cursor-pointer">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-primary transition-colors bg-black/40">
                                    {formData.partner_1_avatar ? (
                                        <img src={formData.partner_1_avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/20">
                                            <span className="material-symbols-outlined text-4xl">person</span>
                                        </div>
                                    )}
                                </div>
                                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                                    <span className="material-symbols-outlined text-white">upload</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarUpload(e, 'partner_1_avatar')} disabled={uploading} />
                                </label>
                            </div>
                            <div className="w-full">
                                <label className="text-xs uppercase font-bold text-white/40 block mb-1 text-center">Partner 1 Name</label>
                                <input
                                    type="text"
                                    value={formData.partner_1_name}
                                    onChange={e => setFormData({ ...formData, partner_1_name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-primary outline-none text-center"
                                    placeholder="Name"
                                />
                            </div>
                        </div>

                        {/* Partner 2 */}
                        <div className="glass p-6 rounded-2xl flex flex-col items-center gap-4">
                            <div className="relative group cursor-pointer">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-primary transition-colors bg-black/40">
                                    {formData.partner_2_avatar ? (
                                        <img src={formData.partner_2_avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/20">
                                            <span className="material-symbols-outlined text-4xl">person</span>
                                        </div>
                                    )}
                                </div>
                                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                                    <span className="material-symbols-outlined text-white">upload</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarUpload(e, 'partner_2_avatar')} disabled={uploading} />
                                </label>
                            </div>
                            <div className="w-full">
                                <label className="text-xs uppercase font-bold text-white/40 block mb-1 text-center">Partner 2 Name</label>
                                <input
                                    type="text"
                                    value={formData.partner_2_name}
                                    onChange={e => setFormData({ ...formData, partner_2_name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-primary outline-none text-center"
                                    placeholder="Name"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-white/50">Anniversary Date</label>
                        <input
                            type="date"
                            value={formData.anniversary_date}
                            onChange={e => setFormData({ ...formData, anniversary_date: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-primary outline-none text-white"
                        />
                    </div>
                </section>

                {/* 3. The Secret Key */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-pink">vpn_key</span>
                        Secret Key
                    </h2>

                    <div className="glass p-6 rounded-xl flex items-center justify-between">
                        <div className="flex-1 mr-4">
                            <p className="text-sm font-bold text-white mb-1">Your Shared Login Code</p>
                            <p className="text-xs text-white/50 mb-2">Used to access this jar from other devices.</p>

                            {showSecret ? (
                                <input
                                    type="text"
                                    value={formData.secret_code || couple?.secret_code || ''}
                                    onChange={(e) => setFormData({ ...formData, secret_code: e.target.value })}
                                    className="bg-black/30 border border-white/10 rounded px-2 py-1 font-mono text-white text-lg w-full max-w-[150px] focus:border-primary outline-none tracking-widest text-center"
                                />
                            ) : (
                                <div className="font-mono text-xl tracking-widest bg-black/30 px-4 py-2 rounded-lg border border-white/10 text-transparent blur-sm select-none">
                                    {couple?.secret_code || '????'}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setShowSecret(!showSecret)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <span className="material-symbols-outlined text-white/60">
                                {showSecret ? 'visibility_off' : 'visibility'}
                            </span>
                        </button>
                    </div>
                </section>

                {/* 4. Account Recovery (Security) */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-pink">security</span>
                        Account Recovery
                    </h2>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-white/50">Security Question</label>
                            <input
                                type="text"
                                placeholder="e.g. What is the name of our first pet?"
                                value={formData.security_question || ''}
                                onChange={e => setFormData({ ...formData, security_question: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-primary outline-none text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-white/50">Security Answer</label>
                            <input
                                type="text"
                                placeholder="Answer (Case Insensitive)"
                                value={formData.security_answer || ''}
                                onChange={e => setFormData({ ...formData, security_answer: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-primary outline-none text-white"
                            />
                            <p className="text-xs text-white/30 italic">Used to recover your code if you forget it.</p>
                        </div>
                    </div>
                </section>

                <div className="pt-8 flex justify-center pb-20">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-primary hover:bg-primary/90 text-background-dark font-bold text-lg px-12 py-4 rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                    >
                        {loading ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;
