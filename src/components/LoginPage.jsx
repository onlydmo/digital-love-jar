import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { safeSetItem } from '../lib/safeStorage';
import { useToast } from '../context/ToastContext';
import StarryBackground from './StarryBackground';
import HelpModal from './HelpModal';

const LoginPage = () => {
    const [pin, setPin] = useState(['', '', '', '']);
    const [error, setError] = useState(false);
    const { login, createCouple } = useAuth(); // Removed loading from context
    const [isLoading, setIsLoading] = useState(false); // Local loading state
    const { addToast } = useToast();
    const inputRef = React.useRef(null);
    const [recoveryMode, setRecoveryMode] = useState(false);
    const [recoveryStep, setRecoveryStep] = useState(1); // 1: Name, 2: Question
    const [recoveryData, setRecoveryData] = useState({ name: '', question: '', answer: '', coupleId: null });
    const [showHelp, setShowHelp] = useState(false);


    // Handle Invite Link
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const inviteCode = params.get('invite');
        if (inviteCode) {
            // Auto-fill and try login
            const validCode = inviteCode.toUpperCase().substring(0, 6);
            if (validCode.length >= 4) {
                // Clear URL for cleanliness
                window.history.replaceState({}, document.title, window.location.pathname);

                // Show feedback
                addToast("Invite code detected! Joining...", 'info');
                setIsLoading(true);

                // Set PIN state for visual
                setPin(validCode.split('').concat(Array(Math.max(4, validCode.length)).fill('')).slice(0, 6));

                // Attempt Login
                login(validCode).then(() => setIsLoading(false));
            }
        }
    }, [login, addToast]);

    const handleInput = async (e) => {
        const val = e.target.value.toUpperCase();
        if (val.length <= 4) {
            const newPin = val.split('').concat(Array(4).fill('')).slice(0, 4);
            setPin(newPin);

            // Auto-submit at 4
            if (val.length === 4) {
                setError(false);
                setIsLoading(true);
                const success = await login(val);
                setIsLoading(false);

                if (!success) {
                    setError(true);
                    setTimeout(() => {
                        setPin(['', '', '', '']);
                        if (inputRef.current) inputRef.current.value = '';
                    }, 1000);
                }
            }
        }
    };

    const handleClear = () => {
        setPin(['', '', '', '']);
        if (inputRef.current) inputRef.current.value = '';
        setError(false);
    };

    const handleCreate = async () => {
        setIsLoading(true);
        const result = await createCouple();
        setIsLoading(false);

        if (result.success) {
            addToast("Success! You are now connected. ✨", 'success');
            safeSetItem('love_jar_newly_created', 'true');
        } else {
            addToast(`Creation Failed: ${result.error.message}`, 'error');
        }
    };

    const handleRecoverySubmit = async (e) => {
        e.preventDefault();
        if (recoveryStep === 1) {
            const { data, error } = await supabase
                .from('couples')
                .select('id, security_question, security_answer, secret_code')
                .or(`partner_1_name.ilike.%${recoveryData.name}%,partner_2_name.ilike.%${recoveryData.name}%`)
                .limit(1)
                .maybeSingle();

            if (data && data.security_question) {
                setRecoveryData({ ...recoveryData, question: data.security_question, _targetAnswer: data.security_answer, _revealCode: data.secret_code });
                setRecoveryStep(2);
                setError(false);
            } else {
                addToast("No connection found with that name, or no security question set.", 'error');
            }
        } else {
            if (recoveryData.answer && recoveryData._targetAnswer && recoveryData.answer.toLowerCase().trim() === recoveryData._targetAnswer.toLowerCase().trim()) {
                addToast(`Your Secret Code is: ${recoveryData._revealCode}`, 'success', 15000);
                setRecoveryMode(false);
                setRecoveryStep(1);
                setRecoveryData({ name: '', question: '', answer: '', coupleId: null });
            } else {
                addToast("Incorrect Answer.", 'error');
            }
        }
    };

    return (
        <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden px-4 bg-background-dark text-white font-display">
            <div className="film-grain opacity-30"></div>
            <StarryBackground />

            {/* Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] animate-pulse-slow pointer-events-none"></div>

            {/* Header / Logo Area */}
            <header className="absolute top-0 left-0 w-full flex items-center justify-between px-8 py-8 md:px-12 z-20">
                <div className="flex items-center gap-3 group cursor-default">
                    <div className="relative size-10 flex items-center justify-center bg-white/5 rounded-xl border border-white/10 group-hover:bg-primary/20 transition-colors duration-500">
                        <span className="material-symbols-outlined text-2xl text-primary group-hover:scale-110 transition-transform">favorite</span>
                        <div className="absolute inset-0 bg-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div>
                        <h2 className="text-white text-lg font-bold leading-none tracking-tight">Digital Love Jar</h2>
                        <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-medium">Synced Forever</span>
                    </div>
                </div>

                <button onClick={() => setShowHelp(true)} className="p-2 text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full">
                    <span className="material-symbols-outlined text-xl">help</span>
                </button>
            </header>

            {/* Main Content */}
            <div className="z-10 flex flex-col items-center max-w-md w-full text-center animate-in fade-in zoom-in-95 duration-1000">

                {/* Glowing Portal Visual */}
                <div className="relative mb-14 group">
                    {/* Outer Rings */}
                    <div className="absolute inset-0 bg-primary/20 blur-[50px] rounded-full scale-110 group-hover:scale-125 transition-transform duration-1000 animate-pulse-slow"></div>
                    <div className="absolute inset-0 border border-white/5 rounded-full scale-150 opacity-20 animate-[spin_10s_linear_infinite]"></div>

                    {/* The Jar Portal */}
                    <div className="relative w-40 h-56 mx-auto rounded-t-full rounded-b-2xl glass-morphism jar-glow flex flex-col items-center justify-center overflow-hidden border-t border-white/20 shadow-2xl shadow-primary/10 group-hover:jar-glow transition-all duration-700">
                        {/* Shine Effect */}
                        <div className="absolute -top-10 -left-10 w-20 h-40 bg-white/10 blur-xl rotate-45"></div>

                        <div className="flex flex-col items-center gap-3 relative z-10 transform group-hover:scale-110 transition-transform duration-500">
                            <span className="material-symbols-outlined text-primary text-5xl drop-shadow-[0_0_15px_rgba(255,189,89,0.5)]">auto_awesome</span>
                            <div className="flex gap-2">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-0"></div>
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-100"></div>
                                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-200"></div>
                            </div>
                        </div>

                        {/* Bottom Fog */}
                        <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-primary/30 to-transparent blur-sm"></div>
                    </div>
                </div>

                {/* Title & Subtitle */}
                <div className="mb-10 space-y-3">
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50 drop-shadow-lg">
                        The Secret Portal
                    </h1>
                    <div className="flex items-center justify-center gap-4">
                        <div className="h-px w-8 bg-gradient-to-l from-white/20 to-transparent"></div>
                        <p className="text-gold-soft/80 text-sm uppercase tracking-[0.3em] font-medium">Enter Your Shared World</p>
                        <div className="h-px w-8 bg-gradient-to-r from-white/20 to-transparent"></div>
                    </div>
                </div>

                {/* PIN Input Area */}
                <div className="w-full max-w-sm space-y-8 relative">

                    {/* Status Message */}
                    <div className={`h-6 text-xs uppercase tracking-[0.2em] font-bold transition-all duration-300 ${error ? 'text-red-400 shake' : 'text-white/40'}`}>
                        {error ? 'Incorrect Code' : 'Enter Shared Secret'}
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); handleInput({ target: { value: inputRef.current.value } }); }} className={`relative group ${error ? 'shake' : ''}`}>

                        <input
                            ref={inputRef}
                            autoFocus
                            className={`w-full bg-white/5 border border-white/10 rounded-2xl text-center text-4xl tracking-[0.5em] font-mono py-6 outline-none text-white placeholder-white/5 transition-all duration-300 ${error ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'focus:border-primary/50 focus:bg-white/10 focus:shadow-[0_0_30px_rgba(255,189,89,0.1)]'}`}
                            placeholder="••••"
                            type="password"
                            maxLength={4}
                            onChange={handleInput}
                            disabled={isLoading}
                        />

                        {/* Hover hint */}
                        <div className="absolute -right-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
                            <div className="bg-white/10 p-2 rounded-full cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </div>
                        </div>
                    </form>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-6 text-xs font-bold tracking-widest uppercase text-white/30">
                        <button onClick={handleCreate} disabled={isLoading} className="hover:text-primary transition-colors flex items-center gap-1 group">
                            {isLoading ? <span className="animate-spin material-symbols-outlined text-xs">sync</span> : null}
                            <span>{isLoading ? 'Creating...' : 'Create New Space'}</span>
                        </button>
                        <span>•</span>
                        <button onClick={handleClear} disabled={isLoading} className="hover:text-white transition-colors disabled:opacity-50">Clear</button>
                        <span>•</span>
                        <button onClick={() => setRecoveryMode(!recoveryMode)} disabled={isLoading} className="hover:text-gold transition-colors disabled:opacity-50">Recover</button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="absolute bottom-6 left-0 w-full text-center z-20">
                <p className="text-[10px] text-white/20 uppercase tracking-widest hover:text-white/40 transition-colors cursor-default">
                    Secured with End-to-End Love Encryption
                </p>
            </footer>

            {/* Help Modal */}
            <HelpModal isOpen={showHelp} onClose={setShowHelp} />

            {/* Recovery Modal Overlay */}
            {recoveryMode && (
                <div className="absolute inset-0 z-50 bg-[#0f0508]/98 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
                    <button onClick={() => setRecoveryMode(false)} className="absolute top-8 right-8 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>

                    <div className="w-full max-w-md space-y-6 text-center">
                        <div className="size-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                            <span className="material-symbols-outlined text-3xl text-gold">lock_open</span>
                        </div>

                        <h3 className="text-3xl font-bold text-white tracking-tight">Recover Access</h3>

                        <form onSubmit={handleRecoverySubmit} className="space-y-4 text-left">
                            {recoveryStep === 1 ? (
                                <>
                                    <label className="text-xs uppercase tracking-widest text-white/50 ml-1">Identify Yourself</label>
                                    <input
                                        type="text"
                                        placeholder="Enter your partner name..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-primary outline-none transition-all placeholder-white/20"
                                        value={recoveryData.name}
                                        onChange={e => setRecoveryData({ ...recoveryData, name: e.target.value })}
                                    />
                                    <p className="text-xs text-white/40 px-1">We'll look for a couple with a matching partner name.</p>
                                </>
                            ) : (
                                <>
                                    <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl mb-4">
                                        <p className="text-xs text-primary uppercase tracking-widest mb-1">Security Question</p>
                                        <p className="font-medium text-lg">{recoveryData.question}</p>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Your Answer..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-primary outline-none transition-all"
                                        value={recoveryData.answer}
                                        onChange={e => setRecoveryData({ ...recoveryData, answer: e.target.value })}
                                    />
                                </>
                            )}

                            <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-background-dark font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] mt-4">
                                {recoveryStep === 1 ? 'Find Account' : 'Reveal Secret Code'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginPage;
